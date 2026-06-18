const { GoogleGenerativeAI } = require("@google/generative-ai");

const DEFAULT_PRIMARY_MODEL = "gemini-2.0-flash-lite";
const DEFAULT_FALLBACK_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash"];

function parseList(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function getApiKeys() {
  const fromList = parseList(process.env.GEMINI_API_KEYS);
  if (fromList.length) return fromList;
  const single = String(process.env.GEMINI_API_KEY || "").trim();
  return single ? [single] : [];
}

function getModelChain() {
  const primary = process.env.GEMINI_MODEL?.trim() || DEFAULT_PRIMARY_MODEL;
  const fallbacks = parseList(process.env.GEMINI_MODEL_FALLBACKS);
  const chain = [primary, ...fallbacks];
  for (const model of DEFAULT_FALLBACK_MODELS) {
    if (!chain.includes(model)) chain.push(model);
  }
  return [...new Set(chain)];
}

function errorText(err) {
  if (!err) return "";
  const parts = [
    err.message,
    err.statusText,
    err.response?.data?.error?.message,
    typeof err.errorDetails === "string" ? err.errorDetails : "",
    Array.isArray(err.errorDetails) ? JSON.stringify(err.errorDetails) : "",
  ];
  return parts.filter(Boolean).join(" ");
}

function isQuotaError(err) {
  const raw = errorText(err);
  return err?.status === 429 || /\b429\b/.test(raw) || /quota exceeded/i.test(raw) || /exceeded your current quota/i.test(raw);
}

function isGeminiSdkError(err) {
  const raw = errorText(err);
  return /GoogleGenerativeAI Error/i.test(raw) || /generativelanguage\.googleapis\.com/i.test(raw);
}

function parseGeminiError(err) {
  const raw = errorText(err);

  if (!getApiKeys().length) {
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
      message: `AI quota is temporarily exceeded (Google free-tier limits). Wait about ${retryAfterSec} seconds and try again. Try GEMINI_MODEL=gemini-2.0-flash-lite in backend/.env, add GEMINI_API_KEYS from another Google account, or enable billing in Google AI Studio.`,
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

  if (isGeminiSdkError(err)) {
    return {
      status: 503,
      code: "GEMINI_ERROR",
      message: "AI request failed. Please try again in a moment.",
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

function formatRouteError(err) {
  if (err?.code && err?.status && err?.message && !isGeminiSdkError(err) && !isQuotaError(err)) {
    return {
      status: err.status,
      code: err.code,
      message: err.message,
      retryAfterSec: err.retryAfterSec,
    };
  }
  return parseGeminiError(err);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateText(prompt, { label = "Gemini" } = {}) {
  const keys = getApiKeys();
  if (!keys.length) throw toHttpError(new Error("GEMINI_API_KEY is not configured on the server."));

  const models = getModelChain();
  let lastErr;

  for (let keyIndex = 0; keyIndex < keys.length; keyIndex += 1) {
    const genAI = new GoogleGenerativeAI(keys[keyIndex]);

    for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
      const modelName = models[modelIndex];

      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const text = result?.response?.text?.();
          if (!text) throw new Error("Empty AI response.");
          if (keyIndex > 0 || modelIndex > 0) {
            // eslint-disable-next-line no-console
            console.warn(`${label}: used fallback key#${keyIndex + 1} model ${modelName}`);
          }
          return text;
        } catch (err) {
          lastErr = err;
          if (!isQuotaError(err)) throw toHttpError(err);

          const raw = errorText(err);
          const retryMatch = raw.match(/retry in ([\d.]+)s/i);
          const retryAfterSec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 0;

          if (attempt === 0 && retryAfterSec > 0 && retryAfterSec <= 20) {
            // eslint-disable-next-line no-console
            console.warn(`${label}: quota on ${modelName}, retrying in ${retryAfterSec}s…`);
            await sleep(retryAfterSec * 1000);
            continue;
          }

          // Try next model or API key after quota exhaustion for this model.
          // eslint-disable-next-line no-console
          console.warn(`${label}: quota hit on ${modelName} (key#${keyIndex + 1}), trying next option…`);
          break;
        }
      }
    }
  }

  throw toHttpError(lastErr || new Error("AI request failed."));
}

module.exports = {
  DEFAULT_PRIMARY_MODEL,
  DEFAULT_FALLBACK_MODELS,
  errorText,
  formatRouteError,
  generateText,
  getApiKeys,
  getModelChain,
  isGeminiSdkError,
  isQuotaError,
  parseGeminiError,
  toHttpError,
};
