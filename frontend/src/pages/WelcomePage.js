import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const steps = [
  {
    step: "01",
    title: "Create your first session",
    desc: "Paste a job description + resume context so questions stay grounded in your story.",
    to: "/interview/new",
    cta: "Start a new interview →",
  },
  {
    step: "02",
    title: "Treat it like a real loop",
    desc: "Turn on camera, speak out loud, and let the transcript + fillers guide the fix.",
    to: "/#how-it-works",
    cta: "See how it works →",
  },
  {
    step: "03",
    title: "Review the scorecard",
    desc: "Export a PDF and compare reps. Momentum comes from iteration, not vibes.",
    to: "/dashboard",
    cta: "Open dashboard →",
  },
];

export default function WelcomePage() {
  const { user } = useAuth();
  const firstName = user?.name?.split?.(" ")?.[0] || "there";

  useEffect(() => {
    document.title = "Welcome · InterviewAI";
  }, []);

  return (
    <div className="page-shell max-w-6xl pb-20 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-900/5 ring-1 ring-white/70 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/70 dark:ring-slate-700/50 md:p-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-aura-coral/25 to-aura-violet/20 blur-3xl"
        />
        <div className="relative">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-violet-700 dark:text-violet-300">
            Welcome
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-aura-ink md:text-5xl">
            Glad you’re here, <span className="italic text-gradient">{firstName}</span>.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Your fastest path to results is simple: do one real rep today, fix one delivery habit, and repeat tomorrow.
            InterviewAI will keep the feedback structured so improvement is obvious.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.title} className="glass-panel-lg rounded-2xl p-6 md:p-7">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-300">{s.step}</span>
                <p className="mt-2 text-sm font-bold text-aura-ink dark:text-slate-100">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.desc}</p>
                <Link
                  to={s.to}
                  className="mt-5 inline-flex items-center gap-1.5 font-semibold text-violet-700 no-underline hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-200"
                >
                  {s.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/70 px-6 py-5 text-sm text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-300 sm:flex-row">
            <span>
              Pro tip: aim for <span className="font-semibold text-aura-ink dark:text-slate-100">3 reps</span> before your next round.
            </span>
            <Link to="/interview/new" className="no-underline">
              <span className="btn-cta px-7 py-3.5 text-sm">Start first rep →</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

