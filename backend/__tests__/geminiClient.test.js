const { parseGeminiError, isQuotaError } = require("../utils/geminiClient");

describe("geminiClient", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });

  test("detects quota errors", () => {
    const err = new Error("[429] You exceeded your current quota");
    expect(isQuotaError(err)).toBe(true);
    process.env.GEMINI_API_KEY = "test-key";
    const parsed = parseGeminiError(err);
    expect(parsed.status).toBe(429);
    expect(parsed.code).toBe("GEMINI_QUOTA_EXCEEDED");
    expect(parsed.message).toMatch(/quota/i);
  });

  test("parses retry delay from quota message", () => {
    process.env.GEMINI_API_KEY = "test-key";
    const parsed = parseGeminiError(new Error("quota exceeded Please retry in 53.92s"));
    expect(parsed.retryAfterSec).toBe(54);
  });
});
