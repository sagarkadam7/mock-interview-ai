const COOKIE_CONSENT_KEY = "ia.cookieConsent.v1";

export function hasAnalyticsConsent() {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.value === "accepted";
  } catch {
    return false;
  }
}

/** Env-gated monitoring hook — extend with Sentry when REACT_APP_SENTRY_DSN is set. */
export function initMonitoring() {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  const dsn = String(process.env.REACT_APP_SENTRY_DSN || "").trim();
  if (!dsn) return;

  // Optional: dynamic import('@sentry/react') when the package is added.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[monitoring] Sentry DSN configured; install @sentry/react to enable.");
  }
}

export function onCookieConsentChanged(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = (event) => callback(event.detail);
  window.addEventListener("ia:cookie-consent", handler);
  return () => window.removeEventListener("ia:cookie-consent", handler);
}
