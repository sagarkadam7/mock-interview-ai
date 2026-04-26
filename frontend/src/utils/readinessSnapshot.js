/**
 * Lightweight “readiness” copy from recent completed sessions (no extra API).
 * Aligns with what paid mock-interview products emphasize: signal + repetition.
 * @param {Array<Record<string, unknown>>} interviews
 * @returns {{ headline: string, bullets: string[] } | null}
 */
export function getReadinessSnapshot(interviews) {
  if (!Array.isArray(interviews) || interviews.length === 0) return null;
  const done = interviews.filter((i) => i.status === "completed" && typeof i.overallScore === "number");
  if (done.length === 0) return null;

  const last = [...done].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const avgScore = last.reduce((s, i) => s + i.overallScore, 0) / last.length;

  const eyes = last.map((i) => i.avgEyeContact).filter((v) => typeof v === "number");
  const avgEye = eyes.length ? eyes.reduce((a, b) => a + b, 0) / eyes.length : null;

  const paces = last.map((i) => i.avgPace).filter((v) => typeof v === "number" && v > 0);
  const avgPace = paces.length ? paces.reduce((a, b) => a + b, 0) / paces.length : null;

  let headline = "Keep stacking reps";
  if (avgScore >= 7.5) headline = "You’re in strong content territory";
  else if (avgScore >= 6) headline = "Solid trajectory — tighten the weak axis";
  else if (avgScore >= 4) headline = "Early signal — prioritize structure + specifics";

  const bullets = [];

  if (avgScore >= 7) {
    bullets.push("Content scores are competitive — invest the next reps in delivery (pace, fillers, gaze).");
  } else {
    bullets.push("Lead with metrics, ownership, and tradeoffs in every primary answer — that’s what moves scores.");
  }

  if (avgEye != null) {
    if (avgEye < 55) {
      bullets.push("Camera presence is dragging overall signal — rehearse looking at the lens, not the preview.");
    } else if (avgEye < 72) {
      bullets.push("Eye contact is workable — one focused rep on “lens-first” answers usually unlocks the next band.");
    } else {
      bullets.push("Gaze is reading confident on average — maintain it when questions get harder.");
    }
  } else {
    bullets.push("Complete at least one full on-camera rep so we can score gaze alongside content.");
  }

  if (avgPace != null) {
    if (avgPace < 115) {
      bullets.push("Pace skews slow — aim for crisp beats and fewer long pauses (target ~130–170 wpm when speaking).");
    } else if (avgPace > 185) {
      bullets.push("Pace skews fast — add intentional pauses after key claims so reviewers can absorb them.");
    } else {
      bullets.push("Speech pace sits in a conversational band — keep that control under follow-up pressure.");
    }
  }

  if (bullets.length > 3) bullets.length = 3;
  return { headline, bullets };
}
