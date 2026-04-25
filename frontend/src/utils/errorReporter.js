export function reportClientError(payload) {
  try {
    // Best-effort fire-and-forget. Backend may or may not implement this endpoint.
    fetch("/api/marketing/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

export function installClientErrorReporter({ sampleRate = 1 } = {}) {
  if (typeof window === "undefined") return () => {};
  if (Math.random() > sampleRate) return () => {};

  const onError = (event, source, lineno, colno, error) => {
    const message = event?.message || String(event);
    reportClientError({
      type: "error",
      message,
      source,
      lineno,
      colno,
      stack: error?.stack,
      href: window.location.href,
      ua: navigator.userAgent,
      ts: Date.now(),
    });
  };

  const onRejection = (event) => {
    reportClientError({
      type: "unhandledrejection",
      message: String(event?.reason?.message || event?.reason || "Unhandled rejection"),
      stack: event?.reason?.stack,
      href: window.location.href,
      ua: navigator.userAgent,
      ts: Date.now(),
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}

