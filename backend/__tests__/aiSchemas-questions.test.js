const { normalizeQuestions } = require("../utils/aiSchemas");

describe("normalizeQuestions", () => {
  test("appends question mark when missing", () => {
    const out = normalizeQuestions([{ text: "Tell me about a challenging project you led", hint: "STAR" }]);
    expect(out).not.toBeNull();
    expect(out[0].text.endsWith("?")).toBe(true);
  });

  test("keeps existing question mark", () => {
    const out = normalizeQuestions([{ text: "What is your greatest strength?", hint: "" }]);
    expect(out[0].text).toBe("What is your greatest strength?");
  });

  test("rejects very short prompts", () => {
    expect(normalizeQuestions([{ text: "Hi?", hint: "" }])).toBeNull();
  });
});
