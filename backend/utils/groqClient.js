function getGroqApiKey() {
  return String(process.env.GROQ_API_KEY || "").trim();
}

function getGroqModel() {
  return process.env.GROQ_MODEL?.trim() || "llama-3.1-8b-instant";
}

function parseGroqError(status, body) {
  const msg = body?.error?.message || body?.message || `Groq API error (${status})`;
  if (status === 429 || /rate limit/i.test(msg)) {
    return {
      status: 429,
      code: "GROQ_QUOTA_EXCEEDED",
      message:
        "Groq free-tier rate limit hit. Wait a minute and try again, or add GEMINI_API_KEY as a fallback in backend/.env.",
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

async function generateTextGroq(prompt, { label = "Groq", model } = {}) {
  const key = getGroqApiKey();
  if (!key) {
    const err = new Error("GROQ_API_KEY is not configured.");
    err.code = "GROQ_NOT_CONFIGURED";
    throw err;
  }

  const modelName = model || getGroqModel();
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.35,
      max_tokens: 4096,
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
    throw err;
  }

  const text = body?.choices?.[0]?.message?.content;
  if (!text || !String(text).trim()) {
    throw new Error("Empty Groq response.");
  }

  // eslint-disable-next-line no-console
  console.log(`${label}: Groq model ${modelName} OK`);
  return String(text).trim();
}

module.exports = {
  generateTextGroq,
  getGroqApiKey,
  getGroqModel,
  parseGroqError,
};
