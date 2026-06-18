const { GoogleGenerativeAI } = require("@google/generative-ai");

const DEFAULT_PRIMARY_MODEL = "gemini-2.0-flash";
const DEFAULT_FALLBACK_MODELS = ["gemini-2.0-flash-lite", "gemini-1.5-flash"];

function parseModelList(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getModelChain() {
  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_PRIMARY_MODEL;
  const fallbacks = parseModelList(process.env.GEMINI_MODEL_FALLBACKS);
  const chain = [primary, ...fallbacks];
  for (const model of DEFAULT_FALLBACK_MODELS) {
    if (!chain.includes(model)) chain.push(model);
  }
  return [...new Set(chain)];
}

function getGenAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error("GEMINI_API_KEY is not configured on the server.");
    err.status = 503;
    err.code = "GEMINI_NOT_CONFIGURED";
    throw err;
  }
  return new GoogleGenerativeAI(key);
}

function isQuotaError(err) {
  const raw = String(err?.message || err || "");
  return err?.status === 429 || raw.includes("[429]") || /quota exceeded/i.test(raw);
}

function parseGeminiError(err) {
  const raw = String(err?.message || err || "");

  if (!process.env.GEMINI_API_KEY) {
    return {
      status: 503,
      code: "GEMINI_NOT_CONFIGURED",
      message: "AI is not configured on the server. Add GEMINI_API_KEY to backend/.env.",
    };
  }

  if (isQuotaError(err)) {
    const retryMatch = raw.match(/retry in ([\d.]+)s/i);
    const retryAfterSec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
    return {
      status: 429,
      code: "GEMINI_QUOTA_EXCEEDED",
      message: `AI quota is temporarily exceeded (Google free-tier limits). Wait about ${retryAfterSec} seconds and try again. If this persists, enable billing in Google AI Studio (https://aistudio.google.com/apikey) or set GEMINI_MODEL=gemini-2.0-flash-lite in backend/.env.`,
      retryAfterSec,
    };
  }

  if (raw.includes("[403]") || /api key not valid|permission denied/i.test(raw)) {
    return {
      status: 503,
      code: "GEMINI_AUTH_FAILED",
      message: "AI API key was rejected. Check GEMINI_API_KEY in backend/.env and that the key is enabled for the Gemini API.",
    };
  }

  if (/GEMINI_API_KEY is not configured/i.test(raw)) {
    return {
      status: 503,
      code: "GEMINI_NOT_CONFIGURED",
      message: "AI is not configured on the server. Add GEMINI_API_KEY to backend/.env.",
    };
  }

  return {
    status: err?.status && err.status >= 400 && err.status < 600 ? err.status : 500,
    code: err?.code || "GEMINI_ERROR",
    message: "AI request failed. Please try again in a moment.",
  };
}

function toHttpError(err) {
  const parsed = parseGeminiError(err);
  const httpErr = new Error(parsed.message);
  httpErr.status = parsed.status;
  httpErr.code = parsed.code;
  if (parsed.retryAfterSec) httpErr.retryAfterSec = parsed.retryAfterSec;
  return httpErr;
}

async function generateText(prompt, { label = "Gemini" } = {}) {
  const genAI = getGenAI();
  const models = getModelChain();
  let lastErr;

  for (let i = 0; i < models.length; i += 1) {
    const modelName = models[i];
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result?.response?.text?.();
      if (!text) throw new Error("Empty AI response.");
      if (i > 0) {
        // eslint-disable-next-line no-console
        console.warn(`${label}: used fallback model ${modelName}`);
      }
      return text;
    } catch (err) {
      lastErr = err;
      const quota = isQuotaError(err);
      const hasMore = i < models.length - 1;
      if (quota && hasMore) {
        // eslint-disable-next-line no-console
        console.warn(`${label}: quota hit on ${modelName}, trying next model…`);
        continue;
      }
      throw toHttpError(err);
    }
  }

  throw toHttpError(lastErr || new Error("AI request failed."));
}

module.exports = {
  DEFAULT_PRIMARY_MODEL,
  DEFAULT_FALLBACK_MODELS,
  generateText,
  getModelChain,
  isQuotaError,
  parseGeminiError,
  toHttpError,
};
