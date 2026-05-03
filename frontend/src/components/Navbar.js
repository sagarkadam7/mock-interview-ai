import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const navMutedLink =
  "inline-flex rounded-full px-3 py-2 text-[12px] font-semibold text-slate-500 no-underline transition-colors hover:bg-slate-100 hover:text-aura-ink dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100";

const navGhostBtn =
  "inline-flex items-center justify-center rounded-full border border-slate-200/90 bg-white/85 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-md transition-[transform,background-color,border-color,color,box-shadow] duration-250 ease-out-expo hover:border-slate-300 hover:bg-white hover:text-aura-ink hover:shadow-md active:scale-[0.97] no-underline sm:px-3 sm:py-1.5 sm:text-xs md:px-4 md:py-2 md:text-[13px] dark:border-slate-600/80 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-800 dark:hover:text-white";

const navGhostActive =
  "!border-slate-300 !bg-white !text-aura-ink shadow-lux dark:!border-slate-500 dark:!bg-slate-800 dark:!text-white";

const navCtaBtn =
  "inline-flex items-center justify-center rounded-full border-0 bg-aura-ink px-4 py-1.5 text-xs font-bold text-aura-page no-underline shadow-md shadow-aura-ink/25 transition-[transform,background-color,box-shadow] duration-250 ease-out-expo hover:bg-zinc-800 hover:shadow-lg active:scale-[0.97] sm:px-4 sm:py-1.5 sm:text-xs md:px-5 md:py-2 md:text-[13px] dark:bg-slate-100 dark:text-slate-900 dark:shadow-black/25 dark:hover:bg-white";

const profilePill =
  "mr-0.5 hidden items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/95 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur-sm transition-colors duration-250 dark:border-slate-600/80 dark:bg-slate-900/80 sm:flex";

const mobileNavLinkClass =
  "flex items-center rounded-xl px-4 py-3 text-[15px] font-semibold text-aura-ink no-underline transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      requestAnimationFrame(() => {
        btnRef.current?.focus();
      });
    };
    const onPointer = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (btnRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointer);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <nav
      aria-label="Primary"
      className={`sticky top-0 z-50 border-b backdrop-blur-md backdrop-saturate-150 transition-[background-color,box-shadow,border-color] duration-300 ease-out-expo ${
        scrolled
          ? "border-slate-200/95 bg-aura-page/95 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12),0_1px_0_0_rgba(10,10,15,0.06)] dark:border-slate-800 dark:bg-aura-dark/96 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45),0_1px_0_0_rgba(255,255,255,0.08)]"
          : "border-aura-edge/80 bg-aura-page/85 shadow-[0_1px_0_0_rgba(10,10,15,0.04)] dark:border-slate-800/90 dark:bg-aura-dark/92 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]"
      }`}
    >
      <div className="relative mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 md:gap-6">
          <NavLink
            to="/"
            className="group relative flex min-w-0 shrink-0 items-center gap-3 no-underline transition-opacity duration-200 hover:opacity-90"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aura-coral to-aura-violet text-xs font-black text-white shadow-lg shadow-aura-violet/25 ring-2 ring-white/50 transition-transform duration-300 group-hover:scale-[1.03]">
              IA
            </span>
            <span className="truncate text-[13px] font-bold tracking-tight text-aura-ink sm:text-sm dark:text-slate-100">InterviewAI</span>
            <span className="absolute -bottom-1 left-11 h-px w-0 bg-gradient-to-r from-aura-coral to-aura-violet transition-[width] duration-350 ease-out-expo group-hover:w-[calc(100%-2.75rem)]" />
          </NavLink>

          <div className="hidden min-w-0 items-center gap-0.5 lg:flex">
            <NavLink
              to="/#how-it-works"
              className={({ isActive }) =>
                `${navMutedLink}${isActive ? " bg-slate-100 text-aura-ink dark:bg-slate-800 dark:text-slate-100" : ""}`
              }
            >
              How it works
            </NavLink>
            <NavLink
              to="/pricing"
              className={({ isActive }) => `${navMutedLink}${isActive ? " bg-slate-100 text-aura-ink dark:bg-slate-800 dark:text-slate-100" : ""}`}
            >
              Pricing
            </NavLink>
            <NavLink to="/faq" className={({ isActive }) => `${navMutedLink}${isActive ? " bg-slate-100 text-aura-ink dark:bg-slate-800 dark:text-slate-100" : ""}`}>
              FAQ
            </NavLink>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2.5">
          <ThemeToggle className="hidden sm:inline-flex" />
          <button
            ref={btnRef}
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/90 bg-white/90 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/40 focus-visible:ring-offset-2 focus-visible:ring-offset-aura-page dark:border-slate-600/80 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-aura-dark lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="text-lg font-light leading-none text-slate-800 dark:text-slate-100" aria-hidden>
              {menuOpen ? "✕" : "☰"}
            </span>
          </button>

          {user ? (
            <>
              <div className={profilePill} title={user.name}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aura-coral to-aura-violet text-sm font-bold text-white ring-2 ring-white/60 dark:ring-slate-700/80">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="max-w-[88px] truncate text-sm font-medium text-slate-600 dark:text-slate-300 md:max-w-[140px]">
                  {user.name.split(" ")[0]}
                </span>
                {(user.plan || "free") !== "free" && (
                  <span className="ml-1 inline-flex items-center rounded-full border border-aura-violet/35 bg-aura-violet/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-aura-violet dark:border-aura-violet/45 dark:bg-aura-violet/15 dark:text-violet-200">
                    Pro
                  </span>
                )}
              </div>
              <NavLink to="/dashboard" className={({ isActive }) => `${navGhostBtn} hidden sm:inline-flex ${isActive ? navGhostActive : ""}`}>
                Dashboard
              </NavLink>
              <NavLink to="/interview/new" className={`${navCtaBtn} hidden sm:inline-flex`}>
                New interview
              </NavLink>
              <button type="button" className={`${navGhostBtn} hidden px-3 text-xs sm:inline-flex sm:px-4 sm:text-[13px]`} onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `${navGhostBtn} hidden sm:inline-flex ${isActive ? navGhostActive : ""}`}>
                Sign in
              </NavLink>
              <NavLink to="/register" className={`${navCtaBtn} hidden sm:inline-flex`}>
                Get started
              </NavLink>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              key="nav-backdrop"
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[98] bg-slate-900/30 backdrop-blur-[2px] dark:bg-black/50 lg:hidden"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              key="nav-panel"
              ref={menuRef}
              id="mobile-nav-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 right-0 top-full z-[99] border-b border-slate-200/90 bg-white/98 px-4 py-4 shadow-lux-lg backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-950/98 lg:hidden"
            >
              <div className="mx-auto flex max-w-7xl flex-col gap-1">
                <div className="flex items-center justify-between px-4 pb-2 pt-1 sm:hidden">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Theme</span>
                  <ThemeToggle />
                </div>
                <div className="mx-4 mb-2 h-px bg-slate-200/90 dark:bg-slate-700/80 sm:hidden" />
                <NavLink to="/pricing" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                  Pricing
                </NavLink>
                <NavLink to="/#how-it-works" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                  How it works
                </NavLink>
                <NavLink to="/faq" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                  FAQ
                </NavLink>
                <NavLink to="/privacy" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                  Privacy
                </NavLink>
                <NavLink to="/terms" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                  Terms
                </NavLink>
                <div className="my-2 h-px bg-slate-200/90 dark:bg-slate-700/80" />
                {user ? (
                  <>
                    <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/interview/new" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                      New interview
                    </NavLink>
                    <button type="button" className={`${mobileNavLinkClass} w-full text-left text-rose-700 dark:text-rose-300`} onClick={handleLogout}>
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className={mobileNavLinkClass} onClick={() => setMenuOpen(false)}>
                      Sign in
                    </NavLink>
                    <NavLink to="/register" className={`${mobileNavLinkClass} justify-center rounded-xl bg-aura-ink text-white hover:bg-zinc-800 hover:text-white`} onClick={() => setMenuOpen(false)}>
                      Get started
                    </NavLink>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
