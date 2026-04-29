const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");
const rateLimit = require("express-rate-limit");
const { generateText } = require("../utils/aiProvider");
const Interview = require("../models/Interview");
const { protect } = require("../middleware/auth");
const { validateMongoId } = require("../middleware/validateMongoId");
const { assertCanCreateInterview, bumpMonthlyInterviewUsage } = require("../middleware/planLimits");
const { parseJsonFromAi } = require("../utils/parseAiJson");
const { normalizeFeedback, normalizeQuestions } = require("../utils/aiSchemas");

const router = express.Router();

const createInterviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: Number(process.env.CREATE_INTERVIEW_RATE_LIMIT_MAX) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many interview sessions created. Try again later." },
});

const answerLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: Number(process.env.ANSWER_RATE_LIMIT_MAX) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many answer submissions. Slow down and try again." },
});


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
function describeSettings({ level, interviewMode, persona, timeboxMin }) {
  const lvl = String(level || "mid").trim();
  const mode = String(interviewMode || "mixed").trim();
  const pers = String(persona || "coach").trim();
  const time = Number(timeboxMin || 0);
  return `Seniority: ${lvl}\nMode: ${mode}\nInterviewer persona: ${pers}\nTimebox: ${time > 0 ? `${time} minutes` : "none"}`;
}

async function generateQuestions(resumeText, jdText, jobRole, settings) {
  const prompt = `You are an expert technical interviewer at a top tech company.

Based on the resume and job description below, generate exactly 7 interview questions.
Make them specific to this candidate's experience and the job role.
Respect the session configuration below. The user's goal is to practice for real interviews.

Session configuration:
${describeSettings(settings)}

Guidelines:
- If Mode is "behavioral": focus on STAR, scope, impact, conflict, leadership.
- If Mode is "technical": focus on fundamentals, debugging, architecture basics, tradeoffs.
- If Mode is "system_design": focus on requirements, scale, data model, APIs, bottlenecks, tradeoffs.
- If Mode is "coding": focus on algorithmic questions appropriate for the level (include constraints hints).
- If Mode is "rapid_fire": shorter questions, higher signal density, less setup.
- If Seniority is senior/staff: raise the bar (ownership, ambiguity, influence, metrics, tradeoffs).
- Persona affects tone: coach = supportive and clear; skeptical/bar_raiser = crisp, probing; friendly = warm.

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

    const raw = await generateText(prompt);
  const parsed = parseJsonFromAi(raw);
  const normalized = normalizeQuestions(parsed);
  if (!normalized) throw new Error("AI did not return a valid question list.");
  return normalized;
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

    const raw = await generateText(prompt);
  const parsed = parseJsonFromAi(raw);
  const normalized = normalizeFeedback(parsed);
  if (!normalized) throw new Error("AI did not return valid feedback.");
  return normalized;
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
async function getAIFeedbackWithOptionalFollowUp(
  questionText,
  userAnswer,
  hint,
  interview,
  jdSnippet,
  deliverySummary
) {
  const prompt = `You are a senior hiring manager and interview coach.

Job role: ${interview.jobRole}
Session configuration:
${describeSettings({
  level: interview.level,
  interviewMode: interview.interviewMode,
  persona: interview.persona,
  timeboxMin: interview.timeboxMin,
})}
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
4) Match the followUp style to the mode and seniority (e.g. system_design probes scale/tradeoffs; behavioral probes impact/conflict; staff probes ambiguity/influence/metrics).

Return ONLY valid JSON with no markdown or backticks:
{
  "score": <integer 0-10>,
  "feedback": "<2-3 sentence overall assessment>",
  "strengths": "<1-2 sentences>",
  "improvements": "<1-2 sentences>",
  "followUp": null | { "text": "<follow-up question ending with ?>", "hint": "<1-2 sentences what a strong follow-up should include>" }
}`;

    const raw = await generateText(prompt);
  const parsed = parseJsonFromAi(raw);
  const normalized = normalizeFeedback(parsed);
  if (!normalized) throw new Error("AI did not return valid feedback.");
  return normalized;
}

// ════════════════════════════════════════════════════════════════
// ROUTE 1: Create a new interview (upload resume + JD)
// POST /api/interview/create
// Body: { jobRole, jdText } + optional file (resume PDF)
// OR Body: { jobRole, resumeText, jdText } for plain text
// ════════════════════════════════════════════════════════════════
router.post(
  "/create",
  protect,
  assertCanCreateInterview,
  createInterviewLimiter,
  upload.single("resume"),
  async (req, res) => {
    try {
      const {
        jobRole,
        jdText,
        resumeText: bodyResumeText,
        level = "mid",
        interviewMode = "mixed",
        persona = "coach",
        timeboxMin = 0,
        targetCompany: rawTargetCompany = "",
      } = req.body;

      const targetCompany = String(rawTargetCompany || "")
        .trim()
        .slice(0, 120);

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
      const settings = {
        level,
        interviewMode,
        persona,
        timeboxMin: Number(timeboxMin || 0),
      };
      const questions = await generateQuestions(resumeText, jdText || "", jobRole, settings);

      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(500).json({ message: "Failed to generate questions. Try again." });
      }

      const interview = await Interview.create({
        userId: req.user._id,
        jobRole,
        level: String(level || "mid").trim(),
        interviewMode: String(interviewMode || "mixed").trim(),
        persona: String(persona || "coach").trim(),
        timeboxMin: Number(timeboxMin || 0),
        targetCompany,
        resumeText,
        jdText: jdText || "",
        status: "pending",
        questions: questions.map((q, i) => ({
          questionType: "primary",
          text: (q.text && String(q.text).trim()) || `Question ${i + 1}`,
          hint:
            (q.hint && String(q.hint).trim()) || "Give a clear example and quantify impact where possible.",
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
  }
);

// ════════════════════════════════════════════════════════════════
// ROUTE 2: List interviews (must be before "/:id")
// GET /api/interview
// ════════════════════════════════════════════════════════════════
router.get("/", protect, async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .select(
        "jobRole targetCompany starred status overallScore avgEyeContact avgPace avgConfidence avgFillerWords createdAt firstAnsweredAt completedAt questions level interviewMode persona timeboxMin"
      )
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
// PATCH meta: private prep notes, star, target company (not in shared report payload by design on share route)
// PATCH /api/interview/:id/meta
// ════════════════════════════════════════════════════════════════
router.patch("/:id/meta", protect, validateMongoId("id"), async (req, res) => {
  try {
    const { candidateNotes, starred, targetCompany } = req.body || {};
    if (candidateNotes === undefined && starred === undefined && targetCompany === undefined) {
      return res.status(400).json({ message: "Provide candidateNotes, starred, and/or targetCompany." });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found." });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    if (typeof candidateNotes === "string") {
      interview.candidateNotes = String(candidateNotes).slice(0, 8000);
    }
    if (typeof starred === "boolean") {
      interview.starred = starred;
    }
    if (typeof targetCompany === "string") {
      interview.targetCompany = String(targetCompany).trim().slice(0, 120);
    }

    await interview.save();
    res.json({
      candidateNotes: interview.candidateNotes,
      starred: interview.starred,
      targetCompany: interview.targetCompany,
    });
  } catch (err) {
    console.error("Patch interview meta error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// Duplicate session: same resume/JD/settings, newly generated questions (counts toward plan).
// POST /api/interview/:id/duplicate
// ════════════════════════════════════════════════════════════════
router.post(
  "/:id/duplicate",
  protect,
  assertCanCreateInterview,
  createInterviewLimiter,
  validateMongoId("id"),
  async (req, res) => {
    try {
      const source = await Interview.findById(req.params.id);
      if (!source) return res.status(404).json({ message: "Interview not found." });
      if (source.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized." });
      }

      const resumeText = (source.resumeText || "").trim();
      if (resumeText.length < 50) {
        return res.status(400).json({ message: "Source session has no usable resume text to duplicate." });
      }

      const settings = {
        level: source.level,
        interviewMode: source.interviewMode,
        persona: source.persona,
        timeboxMin: Number(source.timeboxMin || 0),
      };

      console.log("🤖 Duplicating interview — generating fresh questions…");
      const questions = await generateQuestions(resumeText, source.jdText || "", source.jobRole, settings);
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(500).json({ message: "Failed to generate questions. Try again." });
      }

      const interview = await Interview.create({
        userId: req.user._id,
        jobRole: source.jobRole,
        level: String(source.level || "mid").trim(),
        interviewMode: String(source.interviewMode || "mixed").trim(),
        persona: String(source.persona || "coach").trim(),
        timeboxMin: Number(source.timeboxMin || 0),
        targetCompany: (source.targetCompany && String(source.targetCompany).trim().slice(0, 120)) || "",
        resumeText,
        jdText: source.jdText || "",
        status: "pending",
        questions: questions.map((q, i) => ({
          questionType: "primary",
          text: (q.text && String(q.text).trim()) || `Question ${i + 1}`,
          hint:
            (q.hint && String(q.hint).trim()) || "Give a clear example and quantify impact where possible.",
          orderIndex: i,
        })),
      });

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
      console.error("Duplicate interview error:", err.message);
      res.status(err.status || 500).json({ message: err.message, code: err.code });
    }
  }
);

// ════════════════════════════════════════════════════════════════
// ROUTE 4: Submit answer for one question
// POST /api/interview/:id/answer
// Body: { questionId, answer }
// ════════════════════════════════════════════════════════════════
router.post("/:id/answer", protect, answerLimiter, validateMongoId("id"), async (req, res) => {
  try {
    const {
      questionId,
      answer,
      eyeContactPct,
      fillerWordCount,
      fillerWords,
      wordsPerMinute,
      paceLabel,
      dominantEmotion,
      emotionScores,
      confidenceScore,
    } = req.body;

    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Valid questionId is required." });
    }

    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found." });
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    const hadAnyScoredBefore = interview.questions.some((q) => q.score !== null);

    // Find the specific question
    const question = interview.questions.id(questionId);
    if (!question) return res.status(404).json({ message: "Question not found." });

    const trimmedAnswer = (answer || "").trim();
    const alreadyHasFollowUp = interview.questions.some(
      (q) => q.parentQuestionId && q.parentQuestionId.toString() === question._id.toString()
    );
    const qType = question.questionType || "primary";
    const allowAdaptiveFollowUp = qType === "primary" && !alreadyHasFollowUp && trimmedAnswer.length >= 40;

    console.log(`🤖 Getting Gemini feedback for question ${question.orderIndex + 1}...`);
    let feedback;
    if (allowAdaptiveFollowUp) {
      feedback = await getAIFeedbackWithOptionalFollowUp(
        question.text,
        answer,
        question.hint,
        interview,
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
    if (eyeContactPct !== undefined) question.eyeContactPct = eyeContactPct;
    if (fillerWordCount !== undefined) question.fillerWordCount = fillerWordCount;
    if (fillerWords) question.fillerWords = fillerWords;
    if (wordsPerMinute !== undefined) question.wordsPerMinute = wordsPerMinute;
    if (paceLabel) question.paceLabel = paceLabel;
    if (dominantEmotion) question.dominantEmotion = dominantEmotion;
    if (emotionScores) question.emotionScores = emotionScores;
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

    // Update interview status + session timing
    const allAnswered = interview.questions.every((q) => q.score !== null);
    if (!hadAnyScoredBefore) {
      interview.firstAnsweredAt = new Date();
    }
    interview.status = allAnswered ? "completed" : "in_progress";
    if (allAnswered && !interview.completedAt) {
      interview.completedAt = new Date();
    }

    await interview.save();

    res.json({
      score: question.score,
      feedback: question.feedback,
      strengths: question.strengths,
      improvements: question.improvements,
      followUpInserted,
      questions: interview.questions,
      interviewStatus: interview.status,
      firstAnsweredAt: interview.firstAnsweredAt,
      completedAt: interview.completedAt,
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
      return res
        .status(402)
        .json({ message: "Sharing is a Pro feature. Upgrade to generate a shareable link." });
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





