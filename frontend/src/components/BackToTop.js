import React, { useEffect, useState } from "react";

/**
 * Floating back-to-top button that reveals after ~600px of scroll.
 * Honors prefers-reduced-motion by skipping smooth scroll animation.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    // Return focus to #main-content so keyboard users don't get stranded.
    const main = document.getElementById("main-content");
    if (main) main.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-[70] inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-700 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-all duration-300 ease-out hover:bg-white hover:text-aura-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/50 focus-visible:ring-offset-2 dark:border-slate-700/70 dark:bg-slate-900/90 dark:text-slate-300 dark:shadow-black/30 dark:hover:text-white ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden>
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}
