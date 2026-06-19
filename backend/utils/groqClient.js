const GROQ_MODEL_FALLBACKS = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile"];

function getGroqApiKey() {
  return String(process.env.GROQ_API_KEY || "").trim();
}

function getGroqModelChain() {
  const primary = process.env.GROQ_MODEL?.trim() || GROQ_MODEL_FALLBACKS[0];
  const chain = [primary, ...GROQ_MODEL_FALLBACKS];
  return [...new Set(chain)];
}

function parseGroqError(status, body) {
  const msg = body?.error?.message || body?.message || `Groq API error (${status})`;
  if (status === 429 || /rate limit/i.test(msg)) {
    return {
      status: 429,
      code: "GROQ_QUOTA_EXCEEDED",
      message:
        "Groq rate limit reached. Wait about 60 seconds and try again. Free tier allows limited requests per minute.",
      retryAfterSec: 60,
    };
  }
  if (status === 401 || status === 403) {
    return {
      status: 503,
      code: "GROQ_AUTH_FAILED",
      message: "Groq API key rejected. Check GROQ_API_KEY in backend/.env (get a free key at console.groq.com).",
    };
  }
  return { status: 503, code: "GROQ_ERROR", message: msg.slice(0, 200) };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGroqOnce(prompt, { model, key }) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
      max_tokens: 2048,
    }),
  });

  let body = {};
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    const parsed = parseGroqError(res.status, body);
    const err = new Error(parsed.message);
    err.status = parsed.status;
    err.code = parsed.code;
    if (parsed.retryAfterSec) err.retryAfterSec = parsed.retryAfterSec;
    throw err;
  }

  const text = body?.choices?.[0]?.message?.content;
  if (!text || !String(text).trim()) {
    throw new Error("Empty Groq response.");
  }

  return String(text).trim();
}

async function generateTextGroq(prompt, { label = "Groq", model } = {}) {
  const key = getGroqApiKey();
  if (!key) {
    const err = new Error("GROQ_API_KEY is not configured.");
    err.code = "GROQ_NOT_CONFIGURED";
    throw err;
  }

  const models = model ? [model] : getGroqModelChain();
  let lastErr;

  for (let i = 0; i < models.length; i += 1) {
    const modelName = models[i];
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const text = await callGroqOnce(prompt, { model: modelName, key });
        if (i > 0 || attempt > 0) {
          // eslint-disable-next-line no-console
          console.warn(`${label}: Groq succeeded with model ${modelName} (attempt ${attempt + 1})`);
        } else {
          // eslint-disable-next-line no-console
          console.log(`${label}: Groq model ${modelName} OK`);
        }
        return text;
      } catch (err) {
        lastErr = err;
        const isRateLimit = err?.code === "GROQ_QUOTA_EXCEEDED" || err?.status === 429;
        if (isRateLimit && attempt === 0) {
          const waitSec = err.retryAfterSec || 3;
          // eslint-disable-next-line no-console
          console.warn(`${label}: Groq rate limit on ${modelName}, retrying in ${waitSec}s…`);
          await sleep(waitSec * 1000);
          continue;
        }
        if (isRateLimit && i < models.length - 1) {
          // eslint-disable-next-line no-console
          console.warn(`${label}: Groq rate limit on ${modelName}, trying next model…`);
          break;
        }
        throw err;
      }
    }
  }

  throw lastErr || new Error("Groq request failed.");
}

module.exports = {
  generateTextGroq,
  getGroqApiKey,
  getGroqModelChain,
  parseGroqError,
};
