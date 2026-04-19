import React from "react";
import { useTheme } from "../context/ThemeContext";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-500">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-300">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`relative inline-flex h-10 w-[3.5rem] shrink-0 items-center rounded-full border border-slate-200/90 bg-slate-100/90 shadow-inner transition-colors duration-300 ease-out-expo hover:border-slate-300/90 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/35 focus-visible:ring-offset-2 focus-visible:ring-offset-aura-page dark:border-slate-600/80 dark:bg-slate-800/90 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-slate-950 ${className}`}
    >
      <span className="sr-only">Toggle color theme</span>
      <span
        className={`absolute left-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-700 shadow-md ring-1 ring-slate-200/80 transition-transform duration-300 ease-out-expo dark:bg-slate-700 dark:text-slate-100 dark:ring-slate-600/80 ${
          isDark ? "translate-x-[1.35rem]" : "translate-x-0"
        }`}
        aria-hidden
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}
