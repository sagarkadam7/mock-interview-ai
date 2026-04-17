/**
 * Gemini and similar models sometimes wrap JSON in markdown fences or add prose.
 * Extract and parse the first JSON value (array or object).
 */
function parseJsonFromAi(raw) {
  if (raw == null) throw new Error("Empty AI response");
  const text = String(raw).trim();
  if (!text) throw new Error("Empty AI response");

  let cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  const tryParse = (s) => {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  };

  const direct = tryParse(cleaned);
  if (direct !== null) return direct;

  const firstBracket = Math.min(
    cleaned.indexOf("[") >= 0 ? cleaned.indexOf("[") : Infinity,
    cleaned.indexOf("{") >= 0 ? cleaned.indexOf("{") : Infinity
  );
  if (firstBracket === Infinity) throw new Error("No JSON found in AI response");

  const slice = cleaned.slice(firstBracket);
  const open = slice[0];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let end = -1;
  for (let i = 0; i < slice.length; i++) {
    const c = slice[i];
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) throw new Error("Unbalanced JSON in AI response");

  const jsonStr = slice.slice(0, end + 1);
  const parsed = tryParse(jsonStr);
  if (parsed === null) throw new Error("Invalid JSON in AI response");
  return parsed;
}

module.exports = { parseJsonFromAi };
