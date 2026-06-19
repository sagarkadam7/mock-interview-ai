const { GoogleGenerativeAI } = require("@google/generative-ai");
const { generateTextGroq, getGroqApiKey } = require("./groqClient");

const DEFAULT_PRIMARY_MODEL = "gemini-2.0-flash-lite";
const DEFAULT_FALLBACK_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash"];
const MAX_QUOTA_RETRY_SEC = 65;

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

/** Google returns limit: 0 when the free tier is fully exhausted for that model/project. */
function isHardQuotaZero(err) {
  return /limit:\s*0/i.test(errorText(err));
}

function shouldFastFailGeminiForGroq() {
  return getAiProvider() === "auto" && Boolean(getGroqApiKey());
}

function isGeminiSdkError(err) {
  const raw = errorText(err);
  return /GoogleGenerativeAI Error/i.test(raw) || /generativelanguage\.googleapis\.com/i.test(raw);
}

function getAiProvider() {
  const p = String(process.env.AI_PROVIDER || "auto").trim().toLowerCase();
  if (p === "gemini" || p === "groq" || p === "auto") return p;
  return "auto";
}

function parseGeminiError(err) {
  const raw = errorText(err);

  if (!getApiKeys().length && !getGroqApiKey()) {
    return {
      status: 503,
      code: "AI_NOT_CONFIGURED",
      message:
        "AI is not configured. Add GEMINI_API_KEY and/or a free GROQ_API_KEY (console.groq.com) to backend/.env.",
    };
  }

  if (isQuotaError(err)) {
    const retryMatch = raw.match(/retry in ([\d.]+)s/i);
    const retryAfterSec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
    const groqHint = getGroqApiKey()
      ? " Groq fallback is configured and will be tried automatically."
      : " Add a free GROQ_API_KEY from console.groq.com as a backup.";
    return {
      status: 429,
      code: "GEMINI_QUOTA_EXCEEDED",
      message: `Google AI free-tier quota exceeded. Wait about ${retryAfterSec} seconds and try again.${groqHint} Or enable billing in Google AI Studio.`,
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
  if (err?.code?.startsWith("GROQ_")) {
    return {
      status: err.status || 503,
      code: err.code,
      message: err.message,
    };
  }
  return parseGeminiError(err);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateTextGemini(prompt, { label = "Gemini" } = {}) {
  const keys = getApiKeys();
  if (!keys.length) {
    const err = new Error("GEMINI_API_KEY is not configured.");
    err.code = "GEMINI_NOT_CONFIGURED";
    throw err;
  }

  const fastFail = shouldFastFailGeminiForGroq();
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

          if (fastFail && (isHardQuotaZero(err) || modelIndex === 0)) {
            // eslint-disable-next-line no-console
            console.warn(`${label}: Gemini quota exhausted, fast-failing to Groq…`);
            const httpErr = toHttpError(err);
            httpErr.isGeminiQuotaExhausted = true;
            throw httpErr;
          }

          const raw = errorText(err);
          const retryMatch = raw.match(/retry in ([\d.]+)s/i);
          const retryAfterSec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 0;

          if (
            attempt === 0 &&
            retryAfterSec > 0 &&
            retryAfterSec <= MAX_QUOTA_RETRY_SEC &&
            !isHardQuotaZero(err)
          ) {
            // eslint-disable-next-line no-console
            console.warn(`${label}: quota on ${modelName}, retrying in ${retryAfterSec}s…`);
            await sleep(retryAfterSec * 1000);
            continue;
          }

          // eslint-disable-next-line no-console
          console.warn(`${label}: quota hit on ${modelName} (key#${keyIndex + 1}), trying next option…`);
          break;
        }
      }
    }
  }

  const httpErr = toHttpError(lastErr || new Error("AI request failed."));
  httpErr.isGeminiQuotaExhausted = true;
  throw httpErr;
}

async function generateText(prompt, { label = "AI" } = {}) {
  const provider = getAiProvider();
  const hasGemini = getApiKeys().length > 0;
  const hasGroq = Boolean(getGroqApiKey());

  if (provider === "groq") {
    if (!hasGroq) throw toHttpError(new Error("GROQ_API_KEY is not configured."));
    try {
      return await generateTextGroq(prompt, { label });
    } catch (err) {
      if (err.code) throw err;
      throw toHttpError(err);
    }
  }

  if (provider === "gemini" || (provider === "auto" && hasGemini)) {
    try {
      return await generateTextGemini(prompt, { label });
    } catch (err) {
      if (hasGroq && provider === "auto") {
        // eslint-disable-next-line no-console
        console.warn(`${label}: Gemini unavailable, falling back to Groq…`);
        try {
          return await generateTextGroq(prompt, { label });
        } catch (groqErr) {
          if (groqErr.code) throw groqErr;
          throw toHttpError(groqErr);
        }
      }
      throw err;
    }
  }

  if (hasGroq) {
    return generateTextGroq(prompt, { label });
  }

  throw toHttpError(new Error("No AI provider configured."));
}

module.exports = {
  DEFAULT_PRIMARY_MODEL,
  DEFAULT_FALLBACK_MODELS,
  MAX_QUOTA_RETRY_SEC,
  errorText,
  formatRouteError,
  generateText,
  generateTextGemini,
  getAiProvider,
  getApiKeys,
  getModelChain,
  isGeminiSdkError,
  isQuotaError,
  parseGeminiError,
  toHttpError,
};
