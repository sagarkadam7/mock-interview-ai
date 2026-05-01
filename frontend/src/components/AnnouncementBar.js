import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Change ANNOUNCEMENT_ID any time you want all users to see the bar again.
const ANNOUNCEMENT_ID = "v2-signal-ui-2026-05";
const STORAGE_KEY = "ia.announcement.dismissed";

const ANNOUNCEMENT = {
  badge: "Update",
  message: "Sharper SIGNAL UI, faster builds, and a cleaner nav—try the live coaching demo on the homepage.",
  cta: { label: "Open demo", to: "/#main-content" },
};

/**
 * Slim top-of-page "what's new" strip. Dismissable and versioned — flipping
 * ANNOUNCEMENT_ID re-shows it to everyone (no forced reset logic needed).
 */
export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissedFor = localStorage.getItem(STORAGE_KEY);
      if (dismissedFor !== ANNOUNCEMENT_ID) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, ANNOUNCEMENT_ID);
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Product announcement"
      className="relative z-[55] border-b border-aura-edge/90 bg-gradient-to-r from-aura-signal/10 via-aura-page to-aura-violet/10 text-aura-ink backdrop-blur-sm dark:border-slate-700/80 dark:from-aura-signal/15 dark:via-aura-dark dark:to-aura-violet/20 dark:text-slate-100"
    >
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="inline-flex shrink-0 items-center rounded-full bg-gradient-to-r from-aura-coral to-aura-violet px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-white shadow-sm">
            {ANNOUNCEMENT.badge}
          </span>
          <p className="truncate text-xs font-medium sm:text-sm">
            {ANNOUNCEMENT.message}{" "}
            <Link
              to={ANNOUNCEMENT.cta.to}
              className="font-bold text-aura-violet underline decoration-aura-violet/45 underline-offset-4 transition-colors hover:text-aura-signal hover:decoration-aura-signal/50 dark:text-violet-300 dark:decoration-aura-violet/50 dark:hover:text-violet-200"
            >
              {ANNOUNCEMENT.cta.label} →
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="shrink-0 rounded-full p-1 text-slate-500 transition-colors hover:bg-white/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
