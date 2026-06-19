import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

const TRACK_W = 52;
const THUMB = 28;
const PADDING = 2;
const TRAVEL = TRACK_W - THUMB - PADDING * 2;

const spring = { type: "spring", stiffness: 520, damping: 34, mass: 0.85 };

function SunIcon({ className = "" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon({ className = "" }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`group relative inline-flex shrink-0 items-center rounded-full p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/40 focus-visible:ring-offset-2 focus-visible:ring-offset-aura-page dark:focus-visible:ring-offset-slate-950 ${className}`}
      style={{ width: TRACK_W, height: THUMB + PADDING * 2 }}
    >
      {/* Track */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full border shadow-inner transition-[background,border-color,box-shadow] duration-500 ease-out-expo border-slate-200/80 bg-gradient-to-r from-amber-50 via-slate-100 to-slate-200/90 shadow-slate-200/50 group-hover:border-slate-300/90 group-hover:shadow-md dark:border-slate-600/70 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950/90 dark:shadow-black/40 dark:group-hover:border-slate-500/80"
        aria-hidden
      />

      {/* Ambient glow on hover */}
      <span
        className="pointer-events-none absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400/0 via-aura-violet/0 to-indigo-500/0 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100 dark:from-amber-500/10 dark:via-violet-500/15 dark:to-indigo-400/10"
        aria-hidden
      />

      {/* Static track icons */}
      <span className="pointer-events-none absolute inset-0 flex items-center justify-between px-2" aria-hidden>
        <SunIcon
          className={`transition-all duration-300 ease-out-expo ${
            isDark ? "scale-75 text-amber-400/35" : "scale-100 text-amber-500"
          }`}
        />
        <MoonIcon
          className={`transition-all duration-300 ease-out-expo ${
            isDark ? "scale-100 text-indigo-300" : "scale-75 text-slate-400/40"
          }`}
        />
      </span>

      {/* Thumb */}
      <motion.span
        className="relative z-[1] flex items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(15,23,42,0.12),0_1px_2px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-slate-200/90 dark:bg-slate-100 dark:shadow-[0_2px_12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.15)] dark:ring-slate-500/50"
        style={{ width: THUMB, height: THUMB }}
        initial={false}
        animate={{ x: isDark ? TRAVEL : 0 }}
        transition={reduceMotion ? { duration: 0.01 } : spring}
        whileTap={reduceMotion ? undefined : { scale: 0.94 }}
      >
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={reduceMotion ? false : { opacity: 0, rotate: isDark ? -40 : 40, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={reduceMotion ? { duration: 0.01 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <MoonIcon className="text-indigo-600 dark:text-indigo-700" />
          ) : (
            <SunIcon className="text-amber-500" />
          )}
        </motion.span>
      </motion.span>
    </button>
  );
}
