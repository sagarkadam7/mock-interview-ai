import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Two-tier pricing card set. Both cards stretch to the same height via
// flex-col + h-full; the "Pro" card is emphasised with a violet ring + soft
// shadow-xl shadow-purple-500/20 for a premium glow.
const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    cadence: "/ month",
    tagline: "Everything you need to start rehearsing with structure.",
    highlight: false,
    cta: { label: "Create free account", to: "/register" },
    perks: [
      "Unlimited practice sessions (fair use)",
      "Resume-aware question generation",
      "Browser-native speech analytics",
      "PDF report export",
      "Dashboard history",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    cadence: "/ month",
    tagline: "For candidates chasing senior roles and tight loops.",
    highlight: true,
    badge: "Most popular",
    cta: { label: "Start 14-day Pro trial", to: "/register?plan=pro" },
    perks: [
      "Everything in Starter",
      "Adaptive follow-up questions",
      "Camera-based presence coaching",
      "Advanced scorecards + benchmarks",
      "Priority question generation",
      "Shareable interview links",
    ],
  },
];

function CheckIcon() {
  return (
    <span
      aria-hidden
      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30"
    >
      ✓
    </span>
  );
}

function PlanCard({ plan, index }) {
  const isPro = plan.highlight;
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-8 transition-shadow duration-300 md:p-10 ${
        isPro
          ? "border-violet-300/80 bg-gradient-to-b from-white to-violet-50/60 shadow-xl shadow-purple-500/20 ring-2 ring-violet-400/60 dark:border-violet-500/40 dark:from-slate-900/90 dark:to-slate-900 dark:ring-violet-500/60 dark:shadow-purple-900/40"
          : "border-slate-200/90 bg-white shadow-lg ring-1 ring-white/80 dark:border-slate-700/80 dark:bg-slate-900/70 dark:ring-slate-700/50"
      }`}
    >
      {isPro && (
        <>
          {/* Extra glow element for emphasis */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-aura-violet/25 to-aura-coral/10 blur-3xl"
          />
          <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700 shadow-sm dark:border-violet-500/40 dark:bg-violet-950/60 dark:text-violet-200">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden />
            {plan.badge}
          </span>
        </>
      )}

      <div className="relative">
        <p
          className={`font-mono text-[10px] font-bold uppercase tracking-[0.28em] ${
            isPro ? "text-violet-700 dark:text-violet-300" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {plan.name}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold tracking-tight text-aura-ink dark:text-slate-100">{plan.price}</span>
          <span className="text-slate-500 dark:text-slate-400">{plan.cadence}</span>
        </div>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">{plan.tagline}</p>
      </div>

      <ul className="relative mt-8 flex-1 space-y-3">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            <CheckIcon />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-8">
        <Link to={plan.cta.to} className="no-underline">
          <span
            className={`inline-flex w-full items-center justify-center rounded-full px-8 py-3.5 text-[14px] font-bold tracking-tight no-underline transition-transform duration-200 ease-out active:scale-[0.98] ${
              isPro
                ? "bg-gradient-to-br from-aura-coral via-fuchsia-500 to-aura-violet text-white shadow-[0_14px_40px_-10px_rgba(91,33,182,0.55)] hover:shadow-[0_18px_48px_-10px_rgba(91,33,182,0.65)]"
                : "border border-slate-900/90 bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:border-slate-300 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            }`}
          >
            {plan.cta.label} →
          </span>
        </Link>
        {isPro && (
          <p className="mt-3 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            No credit card · Cancel anytime
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function PricingTeaserSection() {
  return (
    <section className="border-y border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white py-24 dark:border-slate-800/80 dark:from-slate-900 dark:to-slate-950 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <div className="section-eyebrow mx-auto mb-4">Pricing</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">
            Start free. Upgrade when you're interviewing for real.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Every plan includes the full coaching experience. Pick Pro when you want adaptive follow-ups, presence
            analytics, and benchmarks designed for senior loops.
          </p>
        </div>

        {/* grid with items-stretch so cards hit the same height */}
        <div className="grid items-stretch gap-6 md:grid-cols-2 md:gap-8">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/pricing"
            className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900 dark:text-violet-300 dark:decoration-violet-500/60 dark:hover:text-violet-200"
          >
            Compare plans & roadmap →
          </Link>
        </div>
      </div>
    </section>
  );
}
