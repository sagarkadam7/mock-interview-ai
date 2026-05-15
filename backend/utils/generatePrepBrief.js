const { GoogleGenerativeAI } = require("@google/generative-ai");
const { parseJsonFromAi } = require("./parseAiJson");
const { normalizePrepBrief } = require("./aiSchemas");

function getGeminiModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.0-flash" });
}

function describeSettings({ level, interviewMode, persona }) {
  const lvl = String(level || "mid").trim();
  const mode = String(interviewMode || "mixed").trim();
  const pers = String(persona || "coach").trim();
  return `Seniority: ${lvl}, Mode: ${mode}, Persona: ${pers}`;
}

/**
 * Generate a resume-vs-JD prep brief for an interview session.
 * @returns {Promise<object>} Normalized prep brief fields (without status/generatedAt).
 */
async function generatePrepBrief({ jobRole, targetCompany, resumeText, jdText, settings }) {
  const jd = jdText?.trim()
    ? jdText.slice(0, 2500)
    : "Not provided — infer likely requirements from the job role and resume.";
  const company = targetCompany?.trim() ? `Target: ${targetCompany}` : "";

  const prompt = `You are a senior hiring manager and interview coach helping a candidate prepare.

Analyze how well this candidate's resume aligns with the job description for the role below.
Be specific to their experience — no generic advice.

${company}
Job role: ${jobRole}
Session: ${describeSettings(settings || {})}

Resume (excerpt):
${String(resumeText || "").slice(0, 3500)}

Job description:
${jd}

Return ONLY valid JSON (no markdown, no backticks):
{
  "matchScore": <integer 0-100, how well resume signals fit the JD>,
  "summary": "<2-3 sentences: overall fit and what to emphasize in the interview>",
  "strengths": ["<specific resume/JD alignment>", "..."],
  "gaps": [
    { "area": "<skill or experience gap>", "severity": "low|medium|high", "tip": "<actionable prep tip>" }
  ],
  "starStories": [
    { "title": "<short story label from resume>", "prompt": "<what to rehearse — situation, metrics, outcome>" }
  ],
  "focusTips": ["<concrete tip for this role>", "..."]
}

Rules:
- strengths: 2-4 items, each under 120 chars
- gaps: 2-4 items with actionable tips
- starStories: 2-3 items drawn from resume bullets they should rehearse
- focusTips: 3-4 items for interview day
- matchScore should reflect real fit, not always high`;

  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const raw = result?.response?.text?.() || "";
  const parsed = parseJsonFromAi(raw);
  const normalized = normalizePrepBrief(parsed);
  if (!normalized) throw new Error("AI returned an invalid prep brief.");
  return normalized;
}

module.exports = { generatePrepBrief };
