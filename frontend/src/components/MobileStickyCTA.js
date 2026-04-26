import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Mobile-only sticky bottom bar anchoring a primary CTA.
 * Reveals after user scrolls past the hero (~500px) on narrow screens only.
 * Only renders on public marketing routes — hidden on dashboard/interview/auth pages.
 */
const MARKETING_PATHS = new Set(["/", "/pricing", "/faq", "/privacy", "/terms"]);

export default function MobileStickyCTA() {
  const location = useLocation();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!MARKETING_PATHS.has(location.pathname)) return null;
  if (user) return null; // Authenticated users already have primary CTAs in the navbar.

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[75] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] transition-transform duration-300 ease-out sm:hidden ${
        visible ? "translate-y-0" : "translate-y-[110%]"
      }`}
      aria-hidden={!visible}
    >
      <div className="pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-3 py-2 shadow-2xl shadow-slate-900/15 backdrop-blur-md ring-1 ring-white/80 dark:border-slate-700/70 dark:bg-slate-900/95 dark:ring-slate-700/40">
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[12px] font-semibold text-aura-ink dark:text-slate-100">
            Rehearse your real loop
          </span>
          <span className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Free · No credit card
          </span>
        </div>
        <Link
          to="/register"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-aura-coral via-fuchsia-500 to-aura-violet px-4 py-2.5 text-xs font-bold tracking-tight text-white no-underline shadow-[0_10px_24px_-8px_rgba(157,80,187,0.55)] transition-transform active:scale-[0.97]"
        >
          Get started <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
