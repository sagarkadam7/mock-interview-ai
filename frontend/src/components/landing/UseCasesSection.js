import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const USE_CASE_ICONS = ["⌘", "◎", "◈", "✦"];
const BEST_FOR = ["Engineering loops", "Product cases", "Client rounds", "First interviews"];

const USE_CASES = [
  {
    title: "Software engineering",
    desc: "Communicate tradeoffs, architecture, and impact with crisp structure under pressure.",
    bullets: ["System design prompts", "Depth follow-ups", "Pace + filler coaching"],
    accent: "from-sky-500/15 to-indigo-500/10",
    to: "/register?track=swe",
  },
  {
    title: "Product management",
    desc: "Practice case-style answers that connect user problems to metrics and decisions.",
    bullets: ["Execution narratives", "Metric reasoning", "Stakeholder communication"],
    accent: "from-emerald-500/15 to-teal-500/10",
    to: "/register?track=pm",
  },
  {
    title: "Finance & consulting",
    desc: "Tighten frameworks, reduce rambling, and rehearse confident delivery and pacing.",
    bullets: ["Structured frameworks", "Clear assumptions", "Delivery confidence"],
    accent: "from-amber-500/15 to-orange-500/10",
    to: "/register?track=consulting",
  },
  {
    title: "Campus & new grads",
    desc: "Turn projects into stories and handle the most common panel patterns fast.",
    bullets: ["Project deep-dives", "Behavioral rounds", "Confidence reps"],
    accent: "from-aura-coral/15 to-aura-violet/10",
    to: "/register?track=campus",
  },
];

export default function UseCasesSection() {
  return (
    <section
      id="use-cases"
      aria-labelledby="use-cases-heading"
      className="relative scroll-mt-28 overflow-hidden border-y border-slate-200/80 bg-white py-24 dark:border-slate-800/80 dark:bg-slate-950 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='980' height='520' viewBox='0 0 980 520' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%235b21b6' stroke-opacity='.11' stroke-width='1.2'%3E%3Cpath d='M96 392 C230 230 352 470 492 292 S740 150 884 300'/%3E%3Cpath d='M136 132 C284 210 308 82 468 150 S690 248 828 112' stroke-dasharray='8 12'/%3E%3C/g%3E%3Cg fill='%23e85547' fill-opacity='.16'%3E%3Ccircle cx='96' cy='392' r='34'/%3E%3Ccircle cx='492' cy='292' r='28'/%3E%3Ccircle cx='884' cy='300' r='34'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "min(980px, 120vw) auto",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center md:mb-16">
          <div className="section-eyebrow mx-auto mb-4">Use cases</div>
          <h2
            id="use-cases-heading"
            className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl"
          >
            Built for every high-signal interview
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            InterviewAI adapts your prompts and feedback based on role context — so you practice the loop
            you’re actually walking into.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {USE_CASES.map((u, i) => (
            <motion.div
              key={u.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/80 border-l-[3px] border-l-transparent bg-white/90 p-8 shadow-sm ring-1 ring-white/60 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-l-violet-500 hover:shadow-xl hover:shadow-violet-500/10 dark:border-slate-700/70 dark:bg-slate-900/70 dark:ring-slate-700/50 dark:hover:border-l-violet-400 md:p-10"
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${u.accent} opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100`}
              />

              <div className="relative">
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50 text-lg text-violet-700 shadow-inner transition-transform duration-300 group-hover:scale-105 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900 dark:text-violet-300"
                  aria-hidden
                >
                  {USE_CASE_ICONS[i % USE_CASE_ICONS.length]}
                </div>
                <div className="mb-3 inline-flex rounded-full border border-slate-200/80 bg-white/75 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/55 dark:text-slate-400">
                  Best for: {BEST_FOR[i]}
                </div>
                <h3 className="text-xl font-bold tracking-tight text-aura-ink dark:text-slate-100">
                  {u.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{u.desc}</p>
                <ul className="mt-6 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  {u.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30"
                        aria-hidden
                      >
                        ✓
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Link
                    to={u.to}
                    className="inline-flex items-center gap-1.5 font-semibold text-violet-700 no-underline transition-colors hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-200"
                  >
                    Start this track
                    <span aria-hidden className="transition-transform duration-250 group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
