import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "ia.cookieConsent.v1";

// Lightweight cookie banner — no external SDK. Stores decision in localStorage
// so it appears exactly once per browser/device. GDPR-friendly explicit Accept/Decline.
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Delay reveal so it doesn't flash on first paint during hydration.
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage unavailable (e.g. private mode) — show banner anyway.
      setVisible(true);
    }
  }, []);

  const persist = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ value, ts: Date.now() }));
    } catch {
      // Ignored — session-only consent still respected via state.
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-desc"
      className="fixed inset-x-4 bottom-4 z-[90] mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-md ring-1 ring-white/80 dark:border-slate-700/70 dark:bg-slate-900/95 dark:ring-slate-700/40 sm:flex-row sm:items-center sm:gap-6 sm:p-6"
    >
      <div className="flex-1">
        <p id="cookie-title" className="text-sm font-bold text-aura-ink dark:text-slate-100">
          We use cookies to improve your experience
        </p>
        <p id="cookie-desc" className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          We use essential cookies to keep you signed in and anonymous analytics to improve InterviewAI. Read our{" "}
          <Link
            to="/privacy"
            className="font-semibold text-aura-violet underline decoration-aura-violet/40 underline-offset-4 hover:text-aura-ink dark:text-aura-violet dark:hover:text-slate-100"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
      <div className="flex w-full flex-row gap-2 sm:w-auto sm:flex-shrink-0">
        <button
          type="button"
          onClick={() => persist("declined")}
          className="flex-1 rounded-full border border-slate-300/90 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 sm:flex-none"
        >
          Decline
        </button>
        <button
          type="button"
          autoFocus
          aria-label="Accept all cookies"
          onClick={() => persist("accepted")}
          className="flex-1 rounded-full bg-aura-ink px-4 py-2 text-xs font-bold text-white shadow-sm transition-transform hover:shadow-lg active:scale-[0.97] dark:bg-slate-100 dark:text-slate-900 sm:flex-none"
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
