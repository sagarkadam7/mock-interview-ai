import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
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
  "mr-0.5 hidden items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/95 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur-sm transition-colors duration-250 dark:border-slate-600/80 dark:bg-slate-900/80 lg:flex";

const MOBILE_LINKS = [
  { to: "/#how-it-works", label: "How it works", end: false },
  { to: "/pricing", label: "Pricing", end: false },
  { to: "/faq", label: "FAQ", end: false },
];

const MOBILE_LEGAL = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Terms" },
];

function MenuIcon({ open }) {
  return (
    <span className="relative flex h-4 w-5 flex-col justify-center" aria-hidden>
      <span
        className={`absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-out ${
          open ? "top-[7px] rotate-45" : "top-0"
        }`}
      />
      <span
        className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-out ${
          open ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 h-0.5 w-5 rounded-full bg-current transition-all duration-200 ease-out ${
          open ? "top-[7px] -rotate-45" : "top-[14px]"
        }`}
      />
    </span>
  );
}

function mobileLinkClass({ isActive }) {
  return `flex min-h-[44px] items-center rounded-xl px-3 text-[15px] font-semibold no-underline transition-colors ${
    isActive
      ? "bg-violet-50 text-violet-800 dark:bg-violet-950/45 dark:text-violet-200"
      : "text-aura-ink hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800/70"
  }`;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
    if (!menuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      requestAnimationFrame(() => btnRef.current?.focus());
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/login");
  };

  const mobileMenu = (
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
            className="fixed inset-0 z-[98] bg-slate-900/40 backdrop-blur-[3px] dark:bg-black/55 lg:hidden top-[3.75rem] sm:top-16"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <motion.div
            key="nav-panel"
            id="mobile-nav-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 top-[3.75rem] z-[99] max-h-[calc(100dvh-3.75rem)] overflow-y-auto overscroll-contain border-b border-slate-200/90 bg-white shadow-lux-lg dark:border-slate-800/90 dark:bg-slate-950 sm:top-16 sm:max-h-[calc(100dvh-4rem)] lg:hidden"
          >
            <div className="mx-auto flex max-w-lg flex-col px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {user ? (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/80 px-3 py-3 dark:border-slate-700/70 dark:bg-slate-900/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aura-coral to-aura-violet text-sm font-bold text-white">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-aura-ink dark:text-slate-100">{user.name}</p>
                    {user.email ? (
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                    ) : null}
                  </div>
                  {(user.plan || "free") !== "free" && (
                    <span className="shrink-0 rounded-full border border-violet-300/50 bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:border-violet-500/35 dark:bg-violet-950/50 dark:text-violet-200">
                      Pro
                    </span>
                  )}
                </div>
              ) : null}

              <p className="mb-2 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Explore
              </p>
              <nav className="flex flex-col gap-0.5" aria-label="Mobile primary">
                {MOBILE_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={mobileLinkClass}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="my-4 h-px bg-slate-200/90 dark:bg-slate-700/80" />

              <p className="mb-2 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                Account
              </p>
              {user ? (
                <div className="flex flex-col gap-0.5">
                  <NavLink to="/dashboard" className={mobileLinkClass} onClick={closeMenu}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/interview/new" className={mobileLinkClass} onClick={closeMenu}>
                    New interview
                  </NavLink>
                  <button
                    type="button"
                    className="flex min-h-[44px] w-full items-center rounded-xl px-3 text-left text-[15px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/35"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <NavLink to="/login" className={mobileLinkClass} onClick={closeMenu}>
                    Sign in
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-[15px] font-bold text-white no-underline shadow-[0_10px_28px_-10px_rgba(91,33,182,0.55)] transition-transform active:scale-[0.98]"
                    onClick={closeMenu}
                  >
                    Get started free
                  </NavLink>
                </div>
              )}

              <div className="my-4 h-px bg-slate-200/90 dark:bg-slate-700/80" />

              <div className="flex flex-wrap gap-2 px-3">
                {MOBILE_LEGAL.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className="text-xs font-medium text-slate-500 no-underline hover:text-aura-ink dark:text-slate-400 dark:hover:text-slate-200"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <nav
      aria-label="Primary"
      className={`sticky top-0 z-50 border-b backdrop-blur-md backdrop-saturate-150 transition-[background-color,box-shadow,border-color] duration-300 ease-out-expo ${
        scrolled
          ? "border-slate-200/95 bg-aura-page/95 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12),0_1px_0_0_rgba(10,10,15,0.06)] dark:border-slate-800 dark:bg-aura-dark/96 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45),0_1px_0_0_rgba(255,255,255,0.08)]"
          : "border-aura-edge/80 bg-aura-page/85 shadow-[0_1px_0_0_rgba(10,10,15,0.04)] dark:border-slate-800/90 dark:bg-aura-dark/92 dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]"
      }`}
    >
      <div className="relative mx-auto flex h-[3.75rem] max-w-7xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6 lg:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4 md:gap-6">
          <NavLink
            to="/"
            className="group relative flex min-w-0 shrink-0 items-center gap-2.5 no-underline transition-opacity duration-200 hover:opacity-90 sm:gap-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-aura-coral to-aura-violet text-xs font-black text-white shadow-lg shadow-aura-violet/25 ring-2 ring-white/50 transition-transform duration-300 group-hover:scale-[1.03]">
              IA
            </span>
            <span className="truncate text-[13px] font-bold tracking-tight text-aura-ink sm:text-sm dark:text-slate-100">
              InterviewAI
            </span>
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
              className={({ isActive }) =>
                `${navMutedLink}${isActive ? " bg-slate-100 text-aura-ink dark:bg-slate-800 dark:text-slate-100" : ""}`
              }
            >
              Pricing
            </NavLink>
            <NavLink
              to="/faq"
              className={({ isActive }) =>
                `${navMutedLink}${isActive ? " bg-slate-100 text-aura-ink dark:bg-slate-800 dark:text-slate-100" : ""}`
              }
            >
              FAQ
            </NavLink>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />

          {/* Mobile / tablet controls */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <ThemeToggle className="inline-flex sm:hidden" />
            <button
              ref={btnRef}
              type="button"
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white/90 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/40 focus-visible:ring-offset-2 focus-visible:ring-offset-aura-page dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus-visible:ring-offset-aura-dark ${
                menuOpen
                  ? "border-violet-300/80 ring-2 ring-violet-400/20 dark:border-violet-500/45"
                  : "border-slate-200/90 dark:border-slate-600/80"
              }`}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-panel"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MenuIcon open={menuOpen} />
            </button>
          </div>

          {/* Desktop auth actions */}
          {user ? (
            <>
              <div className={profilePill} title={user.name}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aura-coral to-aura-violet text-sm font-bold text-white ring-2 ring-white/60 dark:ring-slate-700/80">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="max-w-[140px] truncate text-sm font-medium text-slate-600 dark:text-slate-300">
                  {user.name.split(" ")[0]}
                </span>
                {(user.plan || "free") !== "free" && (
                  <span className="ml-1 inline-flex items-center rounded-full border border-aura-violet/35 bg-aura-violet/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-aura-violet dark:border-aura-violet/45 dark:bg-aura-violet/15 dark:text-violet-200">
                    Pro
                  </span>
                )}
              </div>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `${navGhostBtn} hidden lg:inline-flex ${isActive ? navGhostActive : ""}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink to="/interview/new" className={`${navCtaBtn} hidden lg:inline-flex`}>
                New interview
              </NavLink>
              <button
                type="button"
                className={`${navGhostBtn} hidden px-3 text-xs lg:inline-flex lg:px-4 lg:text-[13px]`}
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `${navGhostBtn} hidden lg:inline-flex ${isActive ? navGhostActive : ""}`
                }
              >
                Sign in
              </NavLink>
              <NavLink to="/register" className={`${navCtaBtn} hidden lg:inline-flex`}>
                Get started
              </NavLink>
            </>
          )}
        </div>
      </div>

      {typeof document !== "undefined" ? createPortal(mobileMenu, document.body) : null}
    </nav>
  );
}
