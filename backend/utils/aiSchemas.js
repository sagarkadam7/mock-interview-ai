const { z } = require("zod");

const QuestionSchema = z
  .object({
    text: z.string(),
    hint: z.string().optional().default(""),
  })
  .strict();

const FollowUpSchema = z
  .object({
    text: z.string(),
    hint: z.string().optional().default(""),
  })
  .strict();

const FeedbackSchema = z
  .object({
    score: z.number(),
    feedback: z.string(),
    strengths: z.string(),
    improvements: z.string(),
    followUp: FollowUpSchema.nullable().optional(),
  })
  .strict();

function ensureQuestionMark(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return trimmed;
  return trimmed.includes("?") ? trimmed : `${trimmed}?`;
}

function normalizeQuestions(value) {
  const parsed = z.array(QuestionSchema).safeParse(value);
  if (!parsed.success) return null;

  const normalized = parsed.data
    .map((q) => {
      const text = ensureQuestionMark(String(q.text || "").trim()).slice(0, 500);
      return {
        text,
        hint: String(q.hint || "")
          .trim()
          .slice(0, 600),
      };
    })
    .filter((q) => q.text.length >= 10);

  return normalized.length ? normalized : null;
}

function normalizeFeedback(value) {
  const parsed = FeedbackSchema.safeParse(value);
  if (!parsed.success) return null;

  const scoreNum = Number(parsed.data.score);
  const followUp = parsed.data.followUp
    ? {
        text: ensureQuestionMark(String(parsed.data.followUp.text || "").trim()).slice(0, 500),
        hint: String(parsed.data.followUp.hint || "")
          .trim()
          .slice(0, 600),
      }
    : null;

  if (followUp && followUp.text.length < 10) {
    return null;
  }

  return {
    score: Number.isFinite(scoreNum) ? Math.max(0, Math.min(10, Math.round(scoreNum))) : 5,
    feedback: String(parsed.data.feedback || "")
      .trim()
      .slice(0, 1200),
    strengths: String(parsed.data.strengths || "")
      .trim()
      .slice(0, 1200),
    improvements: String(parsed.data.improvements || "")
      .trim()
      .slice(0, 1200),
    followUp,
  };
}

const PrepBriefSchema = z
  .object({
    matchScore: z.number(),
    summary: z.string(),
    strengths: z.array(z.string()).optional().default([]),
    gaps: z
      .array(
        z.object({
          area: z.string(),
          severity: z.enum(["low", "medium", "high"]).optional().default("medium"),
          tip: z.string(),
        })
      )
      .optional()
      .default([]),
    starStories: z
      .array(
        z.object({
          title: z.string(),
          prompt: z.string(),
        })
      )
      .optional()
      .default([]),
    focusTips: z.array(z.string()).optional().default([]),
  })
  .strict();

function normalizePrepBrief(value) {
  const parsed = PrepBriefSchema.safeParse(value);
  if (!parsed.success) return null;

  const scoreNum = Number(parsed.data.matchScore);
  const matchScore = Number.isFinite(scoreNum) ? Math.max(0, Math.min(100, Math.round(scoreNum))) : null;
  if (matchScore === null) return null;

  const trimList = (arr, max, maxLen) =>
    (Array.isArray(arr) ? arr : [])
      .map((s) => String(s || "").trim().slice(0, maxLen))
      .filter(Boolean)
      .slice(0, max);

  const gaps = (parsed.data.gaps || [])
    .map((g) => ({
      area: String(g.area || "").trim().slice(0, 120),
      severity: ["low", "medium", "high"].includes(g.severity) ? g.severity : "medium",
      tip: String(g.tip || "").trim().slice(0, 400),
    }))
    .filter((g) => g.area.length >= 2 && g.tip.length >= 10)
    .slice(0, 5);

  const starStories = (parsed.data.starStories || [])
    .map((s) => ({
      title: String(s.title || "").trim().slice(0, 80),
      prompt: String(s.prompt || "").trim().slice(0, 500),
    }))
    .filter((s) => s.title.length >= 2 && s.prompt.length >= 15)
    .slice(0, 3);

  const summary = String(parsed.data.summary || "").trim().slice(0, 600);
  if (summary.length < 20) return null;

  return {
    matchScore,
    summary,
    strengths: trimList(parsed.data.strengths, 5, 200),
    gaps,
    starStories,
    focusTips: trimList(parsed.data.focusTips, 5, 300),
  };
}

module.exports = {
  normalizeQuestions,
  normalizeFeedback,
  normalizePrepBrief,
};
