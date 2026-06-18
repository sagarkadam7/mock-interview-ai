function isRawGeminiError(text) {
  if (!text || typeof text !== "string") return false;
  return (
    /GoogleGenerativeAI Error/i.test(text) ||
    /generativelanguage\.googleapis\.com/i.test(text) ||
    (/quota exceeded/i.test(text) && /429/.test(text))
  );
}

function friendlyGeminiQuotaMessage(text) {
  const retryMatch = String(text || "").match(/retry in ([\d.]+)s/i);
  const sec = retryMatch ? Math.ceil(parseFloat(retryMatch[1])) : 60;
  return `AI quota is temporarily exceeded (Google free-tier limits). Wait about ${sec} seconds and try again. If this keeps happening, use a lighter model (gemini-2.0-flash-lite) or enable billing in Google AI Studio.`;
}

/** Normalize axios / network errors for user-facing copy. */
export function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const requestId =
    err?.response?.data?.requestId ||
    err?.response?.headers?.["x-request-id"] ||
    err?.response?.headers?.["X-Request-Id"] ||
    null;

  const apiMsg = err?.response?.data?.message;
  const code = err?.response?.data?.code;

  if (code === "GEMINI_QUOTA_EXCEEDED" && typeof apiMsg === "string" && apiMsg.trim()) {
    const clean = apiMsg.trim();
    return requestId ? `${clean} (Request ID: ${requestId})` : clean;
  }

  if (typeof apiMsg === "string" && apiMsg.trim()) {
    if (isRawGeminiError(apiMsg)) {
      const friendly = friendlyGeminiQuotaMessage(apiMsg);
      return requestId ? `${friendly} (Request ID: ${requestId})` : friendly;
    }
    const clean = apiMsg.trim();
    return requestId ? `${clean} (Request ID: ${requestId})` : clean;
  }

  if (isRawGeminiError(err?.message)) {
    const friendly = friendlyGeminiQuotaMessage(err.message);
    return requestId ? `${friendly} (Request ID: ${requestId})` : friendly;
  }

  if (err?.message === "Network Error") return "Network error. Check your connection and try again.";
  return requestId ? `${fallback} (Request ID: ${requestId})` : fallback;
}
