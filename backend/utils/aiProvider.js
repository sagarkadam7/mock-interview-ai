const { GoogleGenerativeAI } = require("@google/generative-ai");
const Anthropic = require("@anthropic-ai/sdk");

function getProviderName(env = process.env) {
  return String(env.AI_PROVIDER || "gemini").trim().toLowerCase();
}

async function generateWithGemini(prompt, env = process.env) {
  const key = env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL || "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateWithAnthropic(prompt, env = process.env) {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured.");
  const client = new Anthropic({ apiKey: key });

  const resp = await client.messages.create({
    model: env.ANTHROPIC_MODEL || "claude-3-5-sonnet-latest",
    max_tokens: Number(env.ANTHROPIC_MAX_TOKENS || 1200),
    temperature: Number(env.ANTHROPIC_TEMPERATURE || 0.2),
    messages: [{ role: "user", content: prompt }],
  });

  const text = resp?.content?.[0]?.text;
  if (!text) throw new Error("Anthropic returned empty response.");
  return text;
}

async function generateText(prompt, env = process.env) {
  const provider = getProviderName(env);

  if (provider === "anthropic") {
    return generateWithAnthropic(prompt, env);
  }

  // Default gemini, with optional fallback.
  try {
    return await generateWithGemini(prompt, env);
  } catch (err) {
    const fallback = String(env.AI_FALLBACK_PROVIDER || "").trim().toLowerCase();
    if (fallback === "anthropic") {
      return generateWithAnthropic(prompt, env);
    }
    throw err;
  }
}

module.exports = {
  generateText,
  getProviderName,
};
