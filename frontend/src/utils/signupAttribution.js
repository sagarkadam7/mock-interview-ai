const STORAGE_KEY = "ia.signupAttribution.v1";

const TRACK_LABELS = {
  campus: "Campus prep track",
  switcher: "Career switcher track",
  senior: "Senior hire track",
  swe: "Software engineering track",
  pm: "Product management track",
  consulting: "Consulting track",
};

export function captureSignupAttribution(searchParams) {
  const track = String(searchParams.get("track") || "")
    .trim()
    .toLowerCase();
  const plan = String(searchParams.get("plan") || "")
    .trim()
    .toLowerCase();
  if (!track && !plan) return null;

  const payload = {
    track: track || undefined,
    plan: plan || undefined,
    capturedAt: Date.now(),
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
  return payload;
}

export function getSignupAttribution() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSignupAttribution() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getAttributionBannerLabel(attribution) {
  if (!attribution) return null;
  if (attribution.track && TRACK_LABELS[attribution.track]) {
    return TRACK_LABELS[attribution.track];
  }
  if (attribution.plan === "pro") return "Pro plan interest";
  if (attribution.track) return `${attribution.track} track`;
  return null;
}

export function isSafeInternalPath(path) {
  if (!path || typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  return true;
}
