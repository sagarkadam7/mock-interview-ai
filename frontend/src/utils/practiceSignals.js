/** @typedef {{ status?: string, createdAt?: string }} InterviewLike */

/**
 * Local calendar date key YYYY-MM-DD for streak / week math.
 * @param {string | Date} d
 */
export function localDateKey(d) {
  const x = d instanceof Date ? d : new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Consecutive calendar days with ≥1 completed session, anchored from today
 * (or yesterday if today has no session yet).
 * @param {InterviewLike[]} interviews
 */
export function computePracticeStreak(interviews) {
  const completed = interviews.filter((i) => i.status === "completed");
  if (completed.length === 0) return 0;
  const dateSet = new Set(completed.map((i) => localDateKey(i.createdAt)));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(today);

  if (!dateSet.has(localDateKey(check))) {
    check.setDate(check.getDate() - 1);
  }

  let streak = 0;
  while (dateSet.has(localDateKey(check))) {
    streak += 1;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}

/**
 * Completed sessions whose createdAt falls in the current ISO week (Mon 00:00 local).
 * @param {InterviewLike[]} interviews
 */
export function countCompletedThisWeek(interviews) {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  return interviews.filter((i) => i.status === "completed" && new Date(i.createdAt) >= start).length;
}

export const WEEKLY_SESSION_GOAL = 3;

/**
 * @param {string | null | undefined} text
 */
function firstSentence(text) {
  if (!text || typeof text !== "string") return null;
  const t = text.trim();
  if (!t) return null;
  const parts = t.split(/(?<=[.!?])\s+/);
  const cut = parts[0] || t;
  return cut.length > 140 ? `${cut.slice(0, 137)}…` : cut;
}

/**
 * Three concrete rehearsal actions after a session (for report / PDF-adjacent UX).
 * @param {{ questions?: Array<{ score?: number | null, improvements?: string, feedback?: string }> }} interview
 * @param {{ msg?: string } | null} focusDim
 */
export function buildNextRepsBullets(interview, focusDim) {
  const bullets = [];
  if (focusDim?.msg) bullets.push(focusDim.msg);

  const answered = (interview.questions || []).filter((q) => typeof q.score === "number");
  let weakest = null;
  for (const q of answered) {
    if (!weakest || (q.score != null && weakest.score != null && q.score < weakest.score)) weakest = q;
  }

  if (weakest && typeof weakest.score === "number") {
    const tip = firstSentence(weakest.improvements) || firstSentence(weakest.feedback);
    if (tip && !bullets.some((b) => b.includes(tip.slice(0, 40))))
      bullets.push(`Lowest-scoring answer (${weakest.score}/10): ${tip}`);
    else if (!bullets.some((b) => /weakest|lowest/i.test(b)))
      bullets.push(`Re-run your weakest prompt (${weakest.score}/10) in 90 seconds — STAR structure, no notes.`);
  }

  const defaults = [
    "Record one 90-second STAR story for your headline win and watch it back for fillers.",
    "Do a 7-minute follow-up drill: answer “Why?” and “What was the tradeoff?” for your last answer.",
    "Reset gaze to the lens at the start of each new sentence for one full practice lap.",
  ];

  for (const d of defaults) {
    if (bullets.length >= 3) break;
    if (!bullets.includes(d)) bullets.push(d);
  }
  return bullets.slice(0, 3);
}
