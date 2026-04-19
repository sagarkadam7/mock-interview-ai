import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const perks = [
  "Unlimited practice sessions (fair use)",
  "Resume-aware question generation",
  "Camera + speech analytics in-browser",
  "PDF reports & dashboard trends",
];

export default function PricingTeaserSection() {
  return (
    <section className="border-y border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white py-24 dark:border-slate-800/80 dark:from-slate-900 dark:to-slate-950 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <div className="section-eyebrow mx-auto mb-4">Pricing</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Start free. Scale when you need.</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-slate-600 dark:text-slate-400">
            We’re focused on product depth first — one generous tier so you can ship reps without friction.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 shadow-lux-lg ring-1 ring-white/80 dark:border-slate-700/80 dark:bg-slate-900/70 dark:ring-slate-700/50 md:p-12"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-aura-violet/15 to-aura-coral/10 blur-3xl" aria-hidden />
          <div className="relative grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-violet-600">Current</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold tracking-tight text-aura-ink">$0</span>
                <span className="text-slate-500 dark:text-slate-400">/ month</span>
              </div>
              <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">Full core product — interviews, AI feedback, reports, and dashboard history.</p>
              <ul className="mt-8 space-y-3">
                {perks.map((x) => (
                  <li key={x} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 ring-1 ring-emerald-200/80">
                      ✓
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4 md:items-end">
              <Link to="/register" className="no-underline">
                <span className="btn-cta inline-flex px-10 py-4 text-[15px] shadow-[0_12px_40px_-8px_rgba(157,80,187,0.35)]">Create free account →</span>
              </Link>
              <Link to="/pricing" className="text-center text-sm font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900 md:text-right">
                Compare plans & roadmap →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
