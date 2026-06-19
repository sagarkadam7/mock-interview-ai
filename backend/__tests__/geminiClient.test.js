const { parseGeminiError, isQuotaError, formatRouteError } = require("../utils/geminiClient");

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

  test("sanitizes full GoogleGenerativeAI SDK error text", () => {
    process.env.GEMINI_API_KEY = "test-key";
    const raw =
      "[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent: [429 ] You exceeded your current quota Please retry in 9.24s";
    const parsed = parseGeminiError(new Error(raw));
    expect(parsed.code).toBe("GEMINI_QUOTA_EXCEEDED");
    expect(parsed.message).not.toMatch(/GoogleGenerativeAI Error/i);
    expect(parsed.retryAfterSec).toBe(10);
  });

  test("formatRouteError handles Groq quota without throwing", () => {
    const err = new Error("Groq rate limit reached. Wait about 60 seconds.");
    err.status = 429;
    err.code = "GROQ_QUOTA_EXCEEDED";
    const formatted = formatRouteError(err);
    expect(formatted.code).toBe("GROQ_QUOTA_EXCEEDED");
    expect(formatted.status).toBe(429);
    expect(formatted.message).toMatch(/Groq rate limit/i);
  });

  test("formatRouteError handles numeric err.code (e.g. MongoDB) without throwing", () => {
    const err = new Error("duplicate key");
    err.status = 500;
    err.code = 11000;
    expect(() => formatRouteError(err)).not.toThrow();
    const formatted = formatRouteError(err);
    expect(formatted.message).toBeTruthy();
  });
});
