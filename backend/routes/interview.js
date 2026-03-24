const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Interview = require("../models/Interview");
const { protect } = require("../middleware/auth");

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// ─── Multer config (PDF uploads) ─────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"), false);
  },
});

// ─── Helper: Extract text from PDF ───────────────────────────
async function extractTextFromPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

// ─── Helper: Generate questions with Gemini ───────────────────
async function generateQuestions(resumeText, jdText, jobRole) {
  const prompt = `You are an expert technical interviewer at a top tech company.

Based on the resume and job description below, generate exactly 7 interview questions.
Make them specific to this candidate's experience and the job role.
Mix behavioral, technical, and situational questions.

Job Role: ${jobRole}
Resume: ${resumeText.slice(0, 3000)}
Job Description: ${jdText ? jdText.slice(0, 2000) : "Not provided - use the job role and resume to infer requirements"}

Return ONLY a valid JSON array. No markdown, no explanation, no backticks, just the raw array:
[
  {
    "text": "Full interview question here?",
    "hint": "What a strong answer should include (1-2 sentences)"
  }
]`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── Helper: Get AI feedback for an answer ───────────────────
async function getAIFeedback(questionText, userAnswer, hint) {
  const prompt = `You are a professional interview coach evaluating a candidate's answer.

Question: ${questionText}
What to look for: ${hint}
Candidate's Answer: ${userAnswer || "(No answer provided - candidate did not respond)"}

Score this answer from 0 to 10 and give constructive feedback.
Return ONLY valid JSON with no markdown or backticks:
{
  "score": <integer 0-10>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": "<1-2 sentences on what they did well>",
  "improvements": "<1-2 sentences on how to improve>"
}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ════════════════════════════════════════════════════════════════
// ROUTE 1: Create a new interview (upload resume + JD)
// POST /api/interview/create
// Body: { jobRole, jdText } + optional file (resume PDF)
// OR Body: { jobRole, resumeText, jdText } for plain text
// ════════════════════════════════════════════════════════════════
router.post("/create", protect, upload.single("resume"), async (req, res) => {
  try {
    const { jobRole, jdText, resumeText: bodyResumeText } = req.body;

    if (!jobRole) {
      return res.status(400).json({ message: "Job role is required." });
    }

    // Extract resume text from PDF or use pasted text
    let resumeText = bodyResumeText || "";
    if (req.file) {
      resumeText = await extractTextFromPDF(req.file.path);
      // Clean up the uploaded file after extraction
      fs.unlink(req.file.path, () => {});
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ message: "Resume text is too short. Please upload a valid resume." });
    }

    // Generate questions with Claude
    console.log("🤖 Generating questions with Gemini...");
    const questions = await generateQuestions(resumeText, jdText || "", jobRole);

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ message: "Failed to generate questions. Try again." });
    }

    // Save interview to MongoDB
    const interview = await Interview.create({
      userId: req.user._id,
      jobRole,
      resumeText,
      jdText: jdText || "",
      status: "pending",
      questions: questions.map((q, i) => ({
        text: q.text,
        hint: q.hint,
        orderIndex: i,
      })),
    });

    console.log(`✅ Interview created: ${interview._id}`);
    res.status(201).json({ interviewId: interview._id, questionCount: interview.questions.length });
  } catch (err) {
    console.error("Create interview error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 2: Get a single interview (with all questions)
// GET /api/interview/:id
// ════════════════════════════════════════════════════════════════
router.get("/:id", protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) return res.status(404).json({ message: "Interview not found." });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    res.json(interview);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 3: Submit answer for one question
// POST /api/interview/:id/answer
// Body: { questionId, answer }
// ════════════════════════════════════════════════════════════════
router.post("/:id/answer", protect, async (req, res) => {
  try {
    const { questionId, answer, eyeContactPct, fillerWordCount, fillerWords, wordsPerMinute, paceLabel, dominantEmotion, emotionScores, confidenceScore } = req.body;

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found." });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // Find the specific question
    const question = interview.questions.id(questionId);
    if (!question) return res.status(404).json({ message: "Question not found." });

    // Get AI feedback
    console.log(`🤖 Getting Gemini feedback for question ${question.orderIndex + 1}...`);
    const feedback = await getAIFeedback(question.text, answer, question.hint);

    // Update the question
    question.answer = answer || "";
    question.feedback = feedback.feedback || "";
    question.strengths = feedback.strengths || "";
    question.improvements = feedback.improvements || "";
    question.score = typeof feedback.score === "number" ? feedback.score : 5;
    question.answeredAt = new Date();
    if (eyeContactPct !== undefined)   question.eyeContactPct   = eyeContactPct;
    if (fillerWordCount !== undefined) question.fillerWordCount = fillerWordCount;
    if (fillerWords)                   question.fillerWords     = fillerWords;
    if (wordsPerMinute !== undefined)  question.wordsPerMinute  = wordsPerMinute;
    if (paceLabel)                     question.paceLabel       = paceLabel;
    if (dominantEmotion)               question.dominantEmotion = dominantEmotion;
    if (emotionScores)                 question.emotionScores   = emotionScores;
    if (confidenceScore !== undefined) question.confidenceScore = confidenceScore;

    // Update interview status
    const allAnswered = interview.questions.every((q) => q.score !== null);
    interview.status = allAnswered ? "completed" : "in_progress";

    await interview.save();

    res.json({
      score: question.score,
      feedback: question.feedback,
      strengths: question.strengths,
      improvements: question.improvements,
    });
  } catch (err) {
    console.error("Submit answer error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 4: Get all interviews for the logged-in user
// GET /api/interview
// ════════════════════════════════════════════════════════════════
router.get("/", protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .select("jobRole status overallScore createdAt questions")
      .sort("-createdAt");

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 5: Delete an interview
// DELETE /api/interview/:id
// ════════════════════════════════════════════════════════════════
router.delete("/:id", protect, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found." });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    await interview.deleteOne();
    res.json({ message: "Interview deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;