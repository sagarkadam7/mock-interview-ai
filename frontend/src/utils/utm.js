const KEY = "ia.utm.v1";
const TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export function captureUtmFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const utm = {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      utm_term: params.get("utm_term") || undefined,
      utm_content: params.get("utm_content") || undefined,
      ref: params.get("ref") || undefined,
      ts: Date.now(),
    };
    const hasAny = Object.entries(utm).some(([k, v]) => k !== "ts" && typeof v === "string" && v.trim());
    if (!hasAny) return;
    localStorage.setItem(KEY, JSON.stringify(utm));
  } catch {
    // ignore
  }
}

export function getStoredUtm() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const utm = JSON.parse(raw);
    if (!utm?.ts || Date.now() - utm.ts > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    const copy = { ...utm };
    delete copy.ts;
    return copy;
  } catch {
    return null;
  }
}

