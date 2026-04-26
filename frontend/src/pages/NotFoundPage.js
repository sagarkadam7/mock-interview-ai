import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// Helpful paths for lost visitors — keeps them inside the funnel.
const QUICK_LINKS = [
  { to: "/", label: "Home", desc: "See the product in action" },
  { to: "/pricing", label: "Pricing", desc: "Starter + Pro plans" },
  { to: "/faq", label: "FAQ", desc: "Common questions" },
  { to: "/privacy", label: "Privacy", desc: "How we handle data" },
];

export default function NotFoundPage() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Page not found · InterviewAI";
  }, []);

  return (
    <div className="page-shell relative flex min-h-[min(100vh,880px)] flex-col items-center justify-center overflow-hidden py-20 md:py-28">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 30% 40%, rgba(255,126,95,0.15), transparent 55%), radial-gradient(ellipse 60% 45% at 75% 65%, rgba(157,80,187,0.12), transparent 55%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl px-6 text-center"
      >
        {/* Oversized 404 glyph */}
        <div
          aria-hidden
          className="pointer-events-none mb-4 select-none bg-gradient-to-br from-aura-coral via-fuchsia-500 to-aura-violet bg-clip-text font-display text-[7rem] font-black leading-none tracking-tighter text-transparent drop-shadow-[0_10px_40px_rgba(157,80,187,0.22)] md:text-[10rem]"
        >
          404
        </div>

        <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
          Lost in the loop
        </p>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-5xl">
          That page didn't make the shortlist.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
          The link may be broken or moved. Try one of the paths below, or head straight back to the hero.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/" className="no-underline">
            <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-aura-coral via-fuchsia-500 to-aura-violet px-8 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_-10px_rgba(157,80,187,0.5)] transition-transform active:scale-[0.97] sm:w-auto">
              Take me home →
            </span>
          </Link>
          <Link to={user ? "/dashboard" : "/login"} className="no-underline">
            <span className="inline-flex items-center justify-center rounded-full border border-slate-300/80 bg-white px-8 py-3.5 text-sm font-semibold text-aura-ink shadow-sm hover:bg-slate-50 dark:border-slate-600/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800 sm:w-auto">
              {user ? "Dashboard" : "Sign in"}
            </span>
          </Link>
        </div>

        {/* Helpful paths grid */}
        <div className="mt-14">
          <p className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
            Or try these
          </p>
          <div className="grid gap-3 text-left sm:grid-cols-2">
            {QUICK_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="group flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-4 no-underline shadow-sm transition-all duration-250 hover:-translate-y-0.5 hover:border-violet-300/80 hover:shadow-lg dark:border-slate-700/70 dark:bg-slate-900/70 dark:hover:border-violet-500/50"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-aura-ink dark:text-slate-100">{l.label}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{l.desc}</p>
                </div>
                <span
                  aria-hidden
                  className="ml-3 text-lg text-slate-400 transition-transform duration-250 group-hover:translate-x-1 group-hover:text-violet-600 dark:text-slate-500 dark:group-hover:text-violet-300"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
