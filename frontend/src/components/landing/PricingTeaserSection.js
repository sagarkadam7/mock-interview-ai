import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PRICING_GUARANTEES, PRO_PLAN, STARTER_PLAN } from "../../data/pricing";

const PLANS = [
  { ...STARTER_PLAN, highlight: false },
  {
    ...PRO_PLAN,
    price: `$${PRO_PLAN.priceMonthly}`,
    cadence: "/ month",
    highlight: true,
    cta: PRO_PLAN.registerCta,
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
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border p-8 transition-all duration-300 ease-out md:p-10 ${
        isPro
          ? "border-violet-300/80 bg-gradient-to-b from-white to-violet-50/60 shadow-xl shadow-purple-500/20 ring-2 ring-violet-400/60 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/25 dark:border-violet-500/40 dark:from-slate-900/90 dark:to-slate-900 dark:ring-violet-500/60 dark:shadow-purple-900/40"
          : "border-slate-200/90 bg-white shadow-lg ring-1 ring-white/80 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-900/70 dark:ring-slate-700/50 dark:hover:border-slate-600"
      }`}
    >
      <span
        className={`absolute inset-x-0 top-0 h-1 ${
          isPro
            ? "bg-gradient-to-r from-aura-coral via-fuchsia-500 to-aura-violet"
            : "bg-gradient-to-r from-slate-300 to-slate-100 dark:from-slate-600 dark:to-slate-800"
        }`}
        aria-hidden
      />
      {isPro && (
        <>
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
          <span className="font-display text-5xl font-bold tracking-tight text-aura-ink dark:text-slate-100">
            {plan.price}
          </span>
          <span className="text-slate-500 dark:text-slate-400">{plan.cadence}</span>
        </div>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {plan.tagline}
        </p>
      </div>

      <ul className="relative mt-8 flex-1 space-y-3">
        {plan.perks.map((perk) => (
          <li
            key={perk}
            className="flex items-start gap-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300"
          >
            <CheckIcon />
            <span>{perk}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-8">
        <Link
          to={plan.cta.to}
          className="no-underline rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-violet-500/50 dark:focus-visible:ring-offset-slate-950"
        >
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
          <p className="mt-3 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Paid checkout coming soon — start free today.
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default function PricingTeaserSection() {
  return (
    <section
      id="pricing"
      className="scroll-mt-24 border-y border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white py-24 dark:border-slate-800/80 dark:from-slate-900 dark:to-slate-950 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <div className="section-eyebrow mx-auto mb-4">Pricing</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">
            Start free. Upgrade when you&apos;re interviewing for real.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Starter includes the full core loop. Pro adds unlimited sessions, prep briefs, and shareable
            reports when you&apos;re in active loops.
          </p>
        </div>

        <div className="grid items-stretch gap-6 md:grid-cols-2 md:gap-8">
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
          aria-label="Pricing guarantees"
        >
          {PRICING_GUARANTEES.map((pill) => (
            <span
              key={pill}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
              {pill}
            </span>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/pricing"
            className="rounded-md font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 outline-none hover:text-violet-900 focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-violet-300 dark:decoration-violet-500/60 dark:hover:text-violet-200 dark:focus-visible:ring-violet-500/50 dark:focus-visible:ring-offset-slate-950"
          >
            Compare plans & roadmap →
          </Link>
        </div>
      </div>
    </section>
  );
}
