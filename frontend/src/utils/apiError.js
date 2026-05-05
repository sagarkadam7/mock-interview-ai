/** Normalize axios / network errors for user-facing copy. */
export function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const requestId =
    err?.response?.data?.requestId ||
    err?.response?.headers?.["x-request-id"] ||
    err?.response?.headers?.["X-Request-Id"] ||
    null;

  const msg = err?.response?.data?.message;
  if (typeof msg === "string" && msg.trim()) {
    const clean = msg.trim();
    return requestId ? `${clean} (Request ID: ${requestId})` : clean;
  }
  if (err?.message === "Network Error") return "Network error. Check your connection and try again.";
  return requestId ? `${fallback} (Request ID: ${requestId})` : fallback;
}
