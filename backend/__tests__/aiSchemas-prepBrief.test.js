const { normalizePrepBrief } = require("../utils/aiSchemas");

describe("normalizePrepBrief", () => {
  test("accepts valid brief", () => {
    const out = normalizePrepBrief({
      matchScore: 72,
      summary: "Strong backend alignment with gaps in system design storytelling for senior scope.",
      strengths: ["5+ years Node.js matches JD", "Led team of 4"],
      gaps: [{ area: "System design", severity: "high", tip: "Prepare one scale story with traffic numbers and tradeoffs." }],
      starStories: [{ title: "Payments migration", prompt: "Rehearse latency reduction % and your ownership." }],
      focusTips: ["Lead with metrics", "Clarify staff-level scope"],
    });
    expect(out).not.toBeNull();
    expect(out.matchScore).toBe(72);
    expect(out.gaps).toHaveLength(1);
    expect(out.starStories).toHaveLength(1);
  });

  test("rejects invalid brief", () => {
    expect(normalizePrepBrief({ matchScore: "nope", summary: "x" })).toBeNull();
    expect(normalizePrepBrief(null)).toBeNull();
  });
});
