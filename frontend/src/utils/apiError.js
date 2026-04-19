/** Normalize axios / network errors for user-facing copy. */
export function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const msg = err?.response?.data?.message;
  if (typeof msg === "string" && msg.trim()) return msg.trim();
  if (err?.message === "Network Error") return "Network error. Check your connection and try again.";
  return fallback;
}
