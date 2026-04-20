const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");
const rateLimit = require("express-rate-limit");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Interview = require("../models/Interview");
const { protect } = require("../middleware/auth");
const { validateMongoId } = require("../middleware/validateMongoId");
const { assertCanCreateInterview, bumpMonthlyInterviewUsage } = require("../middleware/planLimits");
const { parseJsonFromAi } = require("../utils/parseAiJson");

const router = express.Router();

const createInterviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.CREATE_INTERVIEW_RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many interview sessions created. Try again later." },
});

function getGeminiModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });
}

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

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const parsed = parseJsonFromAi(raw);
  if (!Array.isArray(parsed)) throw new Error("AI did not return a question list.");
  return parsed;
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

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const parsed = parseJsonFromAi(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("AI did not return feedback object.");
  }
  return parsed;
}

function buildDeliverySummary(body) {
  const parts = [];
  if (body.eyeContactPct != null && body.eyeContactPct !== "") {
    parts.push(`Eye contact toward camera (approx.): ${body.eyeContactPct}%`);
  }
  if (typeof body.wordsPerMinute === "number" && body.wordsPerMinute > 0) {
    parts.push(`Pace: ${body.wordsPerMinute} wpm (${body.paceLabel || "n/a"})`);
  }
  if (body.fillerWordCount != null && body.fillerWordCount !== "") {
    parts.push(`Filler words counted: ${body.fillerWordCount}`);
  }
  if (body.dominantEmotion) {
    parts.push(`Dominant affect: ${body.dominantEmotion}`);
  }
  if (body.confidenceScore != null && body.confidenceScore !== "") {
    parts.push(`Delivery confidence (model estimate): ${body.confidenceScore}/10`);
  }
  return parts.length ? parts.join("\n") : "No delivery metrics were provided.";
}

// Primary questions: score + feedback + optional ONE follow-up question to drill deeper.
async function getAIFeedbackWithOptionalFollowUp(questionText, userAnswer, hint, jobRole, jdSnippet, deliverySummary) {
  const prompt = `You are a senior hiring manager and interview coach.

Job role: ${jobRole}
Job description (excerpt): ${jdSnippet}

Original interview question: ${questionText}
What a strong answer should include: ${hint}

Candidate's answer (transcript): ${userAnswer || "(No answer provided)"}

Delivery / presence signals from video analysis (may be incomplete):
${deliverySummary}

Tasks:
1) Score the answer 0–10 and give concise coaching (same rubric as a real loop).
2) Decide if ONE short follow-up question would meaningfully deepen signal (e.g. missing metrics, unclear ownership, hand-wavy tradeoffs, weak STAR result, contradictions). If the answer is already strong and specific, or too empty to probe, set followUp to null.
3) If you add followUp, it must be a single focused question (one sentence), not a multi-part exam. It should reference specifics from their answer when possible.

Return ONLY valid JSON with no markdown or backticks:
{
  "score": <integer 0-10>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": "<1-2 sentences>",
  "improvements": "<1-2 sentences>",
  "followUp": null | { "text": "<follow-up question ending with ?>", "hint": "<1-2 sentences what a strong follow-up should include>" }
}`;

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const parsed = parseJsonFromAi(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("AI did not return feedback object.");
  }
  let followUp = null;
  if (parsed.followUp && typeof parsed.followUp === "object" && !Array.isArray(parsed.followUp)) {
    const t = String(parsed.followUp.text || "").trim();
    const h = String(parsed.followUp.hint || "").trim();
    if (t.length > 15 && t.includes("?") && h.length > 10) {
      followUp = { text: t.slice(0, 500), hint: h.slice(0, 600) };
    }
  }
  return {
    score: parsed.score,
    feedback: parsed.feedback,
    strengths: parsed.strengths,
    improvements: parsed.improvements,
    followUp,
  };
}

// ════════════════════════════════════════════════════════════════
// ROUTE 1: Create a new interview (upload resume + JD)
// POST /api/interview/create
// Body: { jobRole, jdText } + optional file (resume PDF)
// OR Body: { jobRole, resumeText, jdText } for plain text
// ════════════════════════════════════════════════════════════════
router.post("/create", protect, assertCanCreateInterview, createInterviewLimiter, upload.single("resume"), async (req, res) => {
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

    console.log("🤖 Generating questions with Gemini...");
    const questions = await generateQuestions(resumeText, jdText || "", jobRole);

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ message: "Failed to generate questions. Try again." });
    }

    const interview = await Interview.create({
      userId: req.user._id,
      jobRole,
      resumeText,
      jdText: jdText || "",
      status: "pending",
      questions: questions.map((q, i) => ({
        questionType: "primary",
        text: (q.text && String(q.text).trim()) || `Question ${i + 1}`,
        hint: (q.hint && String(q.hint).trim()) || "Give a clear example and quantify impact where possible.",
        orderIndex: i,
      })),
    });

    console.log(`✅ Interview created: ${interview._id}`);
    try {
      await bumpMonthlyInterviewUsage(req.user._id);
    } catch (err) {
      if (err?.status === 402) {
        await interview.deleteOne().catch(() => {});
      }
      throw err;
    }
    res.status(201).json({ interviewId: interview._id, questionCount: interview.questions.length });
  } catch (err) {
    console.error("Create interview error:", err.message);
    res.status(err.status || 500).json({ message: err.message, code: err.code });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 2: List interviews (must be before "/:id")
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
// ROUTE 3: Get a single interview (with all questions)
// GET /api/interview/:id
// ════════════════════════════════════════════════════════════════
router.get("/:id", protect, validateMongoId("id"), async (req, res) => {
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
// ROUTE 4: Submit answer for one question
// POST /api/interview/:id/answer
// Body: { questionId, answer }
// ════════════════════════════════════════════════════════════════
router.post("/:id/answer", protect, validateMongoId("id"), async (req, res) => {
  try {
    const { questionId, answer, eyeContactPct, fillerWordCount, fillerWords, wordsPerMinute, paceLabel, dominantEmotion, emotionScores, confidenceScore } = req.body;

    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Valid questionId is required." });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found." });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // Find the specific question
    const question = interview.questions.id(questionId);
    if (!question) return res.status(404).json({ message: "Question not found." });

    const trimmedAnswer = (answer || "").trim();
    const alreadyHasFollowUp = interview.questions.some(
      (q) => q.parentQuestionId && q.parentQuestionId.toString() === question._id.toString()
    );
    const qType = question.questionType || "primary";
    const allowAdaptiveFollowUp =
      qType === "primary" &&
      !alreadyHasFollowUp &&
      trimmedAnswer.length >= 40;

    console.log(`🤖 Getting Gemini feedback for question ${question.orderIndex + 1}...`);
    let feedback;
    if (allowAdaptiveFollowUp) {
      feedback = await getAIFeedbackWithOptionalFollowUp(
        question.text,
        answer,
        question.hint,
        interview.jobRole,
        (interview.jdText || "").slice(0, 2000),
        buildDeliverySummary(req.body)
      );
    } else {
      feedback = { ...(await getAIFeedback(question.text, answer, question.hint)), followUp: null };
    }

    // Update the question
    question.answer = answer || "";
    question.feedback = feedback.feedback || "";
    question.strengths = feedback.strengths || "";
    question.improvements = feedback.improvements || "";
    const rawScore = typeof feedback.score === "number" ? feedback.score : 5;
    question.score = Math.max(0, Math.min(10, Math.round(rawScore)));
    question.answeredAt = new Date();
    if (eyeContactPct !== undefined)   question.eyeContactPct   = eyeContactPct;
    if (fillerWordCount !== undefined) question.fillerWordCount = fillerWordCount;
    if (fillerWords)                   question.fillerWords     = fillerWords;
    if (wordsPerMinute !== undefined)  question.wordsPerMinute  = wordsPerMinute;
    if (paceLabel)                     question.paceLabel       = paceLabel;
    if (dominantEmotion)               question.dominantEmotion = dominantEmotion;
    if (emotionScores)                 question.emotionScores   = emotionScores;
    if (confidenceScore !== undefined) question.confidenceScore = confidenceScore;

    let followUpInserted = false;
    if (allowAdaptiveFollowUp && feedback.followUp) {
      const idx = interview.questions.findIndex((q) => q._id.equals(question._id));
      if (idx !== -1) {
        interview.questions.splice(idx + 1, 0, {
          questionType: "follow_up",
          parentQuestionId: question._id,
          text: feedback.followUp.text,
          hint: feedback.followUp.hint,
          orderIndex: idx + 1,
        });
        interview.questions.forEach((q, i) => {
          q.orderIndex = i;
        });
        interview.markModified("questions");
        followUpInserted = true;
      }
    }

    // Update interview status
    const allAnswered = interview.questions.every((q) => q.score !== null);
    interview.status = allAnswered ? "completed" : "in_progress";

    await interview.save();

    res.json({
      score: question.score,
      feedback: question.feedback,
      strengths: question.strengths,
      improvements: question.improvements,
      followUpInserted,
      questions: interview.questions,
    });
  } catch (err) {
    console.error("Submit answer error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// ROUTE 5: Delete an interview
// DELETE /api/interview/:id
// ════════════════════════════════════════════════════════════════
router.post("/:id/share", protect, validateMongoId("id"), async (req, res) => {
  try {
    if ((req.user.plan || "free") === "free") {
      return res.status(402).json({ message: "Sharing is a Pro feature. Upgrade to generate a shareable link." });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found." });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }
    if (interview.status !== "completed") {
      return res.status(409).json({ message: "You can share a report after completing the interview." });
    }

    if (!interview.shareToken) {
      interview.shareToken = crypto.randomBytes(24).toString("base64url");
      interview.sharedAt = new Date();
      await interview.save();
    }

    res.json({ token: interview.shareToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, validateMongoId("id"), async (req, res) => {
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