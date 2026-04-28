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

function normalizeQuestions(value) {
  const parsed = z.array(QuestionSchema).safeParse(value);
  if (!parsed.success) return null;

  const normalized = parsed.data
    .map((q) => ({
      text: String(q.text || "")
        .trim()
        .slice(0, 500),
      hint: String(q.hint || "")
        .trim()
        .slice(0, 600),
    }))
    .filter((q) => q.text.length >= 10 && q.text.includes("?"));

  return normalized.length ? normalized : null;
}

function normalizeFeedback(value) {
  const parsed = FeedbackSchema.safeParse(value);
  if (!parsed.success) return null;

  const scoreNum = Number(parsed.data.score);
  const followUp = parsed.data.followUp
    ? {
        text: String(parsed.data.followUp.text || "")
          .trim()
          .slice(0, 500),
        hint: String(parsed.data.followUp.hint || "")
          .trim()
          .slice(0, 600),
      }
    : null;

  if (followUp && (followUp.text.length < 10 || !followUp.text.includes("?"))) {
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

module.exports = {
  normalizeQuestions,
  normalizeFeedback,
};
