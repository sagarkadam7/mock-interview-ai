import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "interviewai-theme";

/** Marketing / landing inline-style palette (separate from Tailwind aura tokens). */
export const PALETTE_LIGHT = {
  ink: "#0a0a0f",
  paper: "#fafaf8",
  card: "#ffffff",
  band: "#0a0a0f",
  coral: "#ff5c3a",
  violet: "#7c3aed",
  gold: "#c9a84c",
  muted: "#6b7280",
  border: "rgba(15,23,42,0.08)",
  dividerLine: "rgba(15,23,42,0.13)",
  marqueeText: "#9ca3af",
  cardShadow: "0 2px 20px rgba(0,0,0,0.04)",
};

export const PALETTE_DARK = {
  ink: "#e8eaf0",
  paper: "#06070c",
  card: "#10141f",
  band: "#03050c",
  coral: "#ff8a6e",
  violet: "#b49cff",
  gold: "#d4b868",
  muted: "#94a3b8",
  border: "rgba(148,163,184,0.16)",
  dividerLine: "rgba(255,255,255,0.12)",
  marqueeText: "#64748b",
  cardShadow: "0 2px 32px rgba(0,0,0,0.5)",
};

const ThemeContext = createContext(null);

function readStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  return "light";
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    const meta = typeof document !== "undefined" ? document.querySelector('meta[name="theme-color"]') : null;
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#06070c" : "#f4f4f7");
    }
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const setTheme = useCallback((t) => {
    if (t === "light" || t === "dark") setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const palette = useMemo(() => (theme === "dark" ? PALETTE_DARK : PALETTE_LIGHT), [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggleTheme, palette }), [theme, setTheme, toggleTheme, palette]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
