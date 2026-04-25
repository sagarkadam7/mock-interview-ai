import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SiteFooter from "../components/SiteFooter";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { upgradePlan } from "../utils/api";
import { getApiErrorMessage } from "../utils/apiError";

const free = [
  "3 mock sessions / month (free plan cap)",
  "7 tailored questions per interview",
  "Gemini-powered feedback & scores",
  "Camera + speech analytics",
  "Dashboard trends & PDF export",
];

const pro = [
  "Unlimited mock sessions",
  "Shareable report links (send to mentors)",
  "Practice streaks + weekly goals",
  "Priority AI queue (future)",
  "Early access to new analytics",
];

const soon = ["Team / cohort dashboards", "ATS integrations", "Custom rubrics per company"];
const pricingFaq = [
  { q: "Is Pro refundable?", a: "If Pro isn’t helping you practice more effectively, we’ll make it right. Reach out and we’ll help you troubleshoot or refund." },
  { q: "Can I cancel anytime?", a: "Yes. Pro is month-to-month. Cancel anytime and keep access until the end of the billing period." },
  { q: "Do I need Pro to try the product?", a: "No. Starter is free and includes the core interview flow so you can see your scorecard before upgrading." },
];

export default function PricingPage() {
  const { user, login } = useAuth();
  const [upgrading, setUpgrading] = useState(false);
  const [billing, setBilling] = useState("monthly"); // monthly | annual
  const plan = (user?.plan || "free").toLowerCase();
  const isPro = plan === "pro" || plan === "team";
  const ctaLabel = useMemo(() => {
    if (!user) return "Create free account →";
    if (isPro) return "You’re on Pro";
    return "Upgrade to Pro (dev) →";
  }, [user, isPro]);

  const proPrice = billing === "annual" ? 9 : 12;
  const proCadence = billing === "annual" ? "/ month · billed annually" : "/ month";

  return (
    <div className="min-h-screen">
    <div className="page-shell max-w-5xl pb-20">
      <div className="mb-14 border-b border-slate-200/80 pb-10 dark:border-slate-800/80">
        <div className="section-eyebrow mb-4">Pricing</div>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-aura-ink md:text-5xl">Simple today. Ambitious tomorrow.</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
          Start free, then upgrade when you want unlimited sessions and shareable reports for mentors and referrals.
        </p>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Questions?{" "}
          <Link to="/faq" className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900 dark:text-violet-400 dark:decoration-violet-500/50 dark:hover:text-violet-300">
            Read the FAQ
          </Link>
          .
        </p>
      </div>

      <div className="mb-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/70 px-6 py-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/45 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-aura-ink dark:text-slate-100">Choose billing</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">Annual saves ~25%. Switch anytime.</p>
        </div>
        <div className="inline-flex rounded-full border border-slate-200/80 bg-white p-1 dark:border-slate-700/70 dark:bg-slate-900/60">
          {[
            { id: "monthly", label: "Monthly" },
            { id: "annual", label: "Annual (save)" },
          ].map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setBilling(o.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                billing === o.id
                  ? "bg-aura-ink text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
              aria-pressed={billing === o.id}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel-lg relative overflow-hidden rounded-3xl p-8 md:p-10"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-violet-200/40 to-transparent blur-3xl dark:from-violet-900/35 dark:to-transparent" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-violet-700 dark:text-violet-300">Starter</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-aura-ink">$0</span>
            <span className="text-slate-500 dark:text-slate-400">/ month</span>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Everything you need to run serious reps — no credit card.</p>
          <ul className="mt-8 space-y-3">
            {free.map((x) => (
              <li key={x} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/50">
                  ✓
                </span>
                {x}
              </li>
            ))}
          </ul>
          {!user ? (
            <Link to="/register" className="mt-10 block no-underline">
              <span className="btn-cta flex w-full justify-center py-4">Create free account →</span>
            </Link>
          ) : (
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 text-sm text-slate-600 dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-300">
              You’re currently on <strong className="font-semibold text-aura-ink">{plan.toUpperCase()}</strong>.
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.06 }}
          className="glass-panel-lg relative overflow-hidden rounded-3xl p-8 ring-2 ring-violet-400/45 shadow-xl shadow-purple-500/15 md:p-10 dark:ring-violet-500/50"
        >
          <div className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-gradient-to-tr from-orange-200/35 to-transparent blur-3xl dark:from-orange-950/40 dark:to-transparent" aria-hidden />
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-aura-coral dark:text-aura-coral">Pro</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-5xl font-bold text-aura-ink">${proPrice}</span>
            <span className="text-slate-500 dark:text-slate-400">{proCadence}</span>
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Unlimited practice + shareable signal. Built for serious prep loops.</p>
          <ul className="mt-8 space-y-3">
            {pro.map((x) => (
              <li key={x} className="flex gap-3 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs text-violet-700 ring-1 ring-violet-200/80 dark:bg-violet-950/55 dark:text-violet-200 dark:ring-violet-800/50">
                  ✦
                </span>
                {x}
              </li>
            ))}
          </ul>
          {!user ? (
            <Link to="/register" className="mt-10 block no-underline">
              <span className="btn-cta flex w-full justify-center py-4">Start free →</span>
            </Link>
          ) : (
            <button
              type="button"
              className="btn-cta mt-10 flex w-full justify-center py-4 disabled:opacity-70"
              disabled={upgrading || isPro}
              aria-busy={upgrading}
              onClick={async () => {
                try {
                  setUpgrading(true);
                  const { data } = await upgradePlan("pro");
                  const nextUser = { ...user, ...data.user };
                  login(nextUser);
                  toast.success("Upgraded to Pro");
                } catch (err) {
                  toast.error(getApiErrorMessage(err, "Upgrade failed."));
                } finally {
                  setUpgrading(false);
                }
              }}
            >
              {upgrading ? "Upgrading…" : ctaLabel}
            </button>
          )}
        </motion.div>
      </div>

      <div className="mt-10 rounded-3xl border border-emerald-200/70 bg-emerald-50/70 p-6 text-sm text-emerald-950 shadow-sm dark:border-emerald-500/25 dark:bg-emerald-950/40 dark:text-emerald-50 md:p-8">
        <p className="font-semibold">30-day outcome guarantee</p>
        <p className="mt-2 leading-relaxed text-emerald-900/80 dark:text-emerald-100/80">
          If you don’t feel more confident and structured after consistent reps, we’ll help you fix your workflow or refund Pro.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm leading-relaxed text-slate-600 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/55 dark:text-slate-300 md:p-8">
          <strong className="font-semibold text-aura-ink">Fair use:</strong> automated systems may rate-limit abusive traffic to keep latency low for everyone. Personal practice within normal bounds is always the goal.
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm leading-relaxed text-slate-600 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/55 dark:text-slate-300 md:p-8">
          <strong className="font-semibold text-aura-ink">Roadmap:</strong>
          <ul className="mt-4 space-y-2">
            {soon.map((x) => (
              <li key={x} className="flex gap-3">
                <span className="text-slate-400 dark:text-slate-500" aria-hidden>
                  ○
                </span>
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <div className="section-eyebrow mb-4">Pricing FAQ</div>
        <div className="grid gap-4 md:grid-cols-3">
          {pricingFaq.map((x) => (
            <div key={x.q} className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/55">
              <p className="text-sm font-bold text-aura-ink dark:text-slate-100">{x.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{x.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-6 py-5 text-sm text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-300">
        <span>
          Prefer to try it first?{" "}
          <span className="font-semibold text-aura-ink dark:text-slate-100">Run one session</span> and decide after you see your scorecard.
        </span>
        <Link to="/interview/new" className="no-underline">
          <span className="btn-primary">Start a session →</span>
        </Link>
      </div>
    </div>
    <SiteFooter />
    </div>
  );
}
