import React from "react";
import { motion } from "framer-motion";

const QUOTES = [
  {
    quote:
      "The transcript + filler highlighting made my answers instantly cleaner. I fixed more in 2 sessions than in 2 weeks of random prep.",
    name: "SWE candidate",
    meta: "Campus + internship loops",
  },
  {
    quote:
      "It’s the first tool that feels like a real debrief: what I said, how I said it, and what to change next.",
    name: "PM candidate",
    meta: "Case + behavioral rounds",
  },
  {
    quote:
      "The scorecard is addictive in the best way. You can see momentum instead of guessing if you improved.",
    name: "Experienced hire",
    meta: "Senior IC interviews",
  },
  {
    quote:
      "I rehearsed the exact story I wanted to tell, then tightened pacing. My real interview felt familiar.",
    name: "Career switcher",
    meta: "Role transition",
  },
];

const OUTCOMES = [
  { k: "Time to first confident rep", v: "1 day" },
  { k: "Avg. filler reduction", v: "↓ 27%" },
  { k: "Pace stabilization", v: "± 12 wpm" },
  { k: "Report exports", v: "10k+" },
];
const METRIC_ACCENTS = ["bg-aura-coral", "bg-aura-violet", "bg-emerald-500", "bg-amber-500"];

export default function QuoteWallSection() {
  return (
    <section
      id="outcomes"
      aria-labelledby="outcomes-heading"
      className="relative scroll-mt-24 py-24 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[min(80%,520px)] -translate-y-1/2 bg-gradient-to-r from-orange-50/45 via-transparent to-violet-50/40 blur-3xl dark:from-orange-950/20 dark:to-violet-950/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-12 h-[420px] opacity-70 dark:opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='920' height='420' viewBox='0 0 920 420' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%235b21b6' stroke-opacity='.11' stroke-width='1.4'%3E%3Cpath d='M118 100h210a36 36 0 0 1 36 36v72a36 36 0 0 1-36 36h-96l-62 54 16-54h-68a36 36 0 0 1-36-36v-72a36 36 0 0 1 36-36Z'/%3E%3Cpath d='M568 132h214a34 34 0 0 1 34 34v76a34 34 0 0 1-34 34h-76l-68 50 20-50h-90a34 34 0 0 1-34-34v-76a34 34 0 0 1 34-34Z'/%3E%3C/g%3E%3Cg fill='%23e85547' fill-opacity='.14'%3E%3Ccircle cx='174' cy='170' r='7'/%3E%3Ccircle cx='216' cy='170' r='7'/%3E%3Ccircle cx='258' cy='170' r='7'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "min(920px, 118vw) auto",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center md:mb-16">
          <div className="section-eyebrow mx-auto mb-4">Outcomes</div>
          <h2
            id="outcomes-heading"
            className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl"
          >
            Proof that feels like <span className="italic text-gradient">signal</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Not hype. The kind of feedback loop you can repeat: rep → scorecard → fix → rep.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {QUOTES.map((q, i) => (
              <motion.figure
                key={q.quote}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="glass-panel-lg group rounded-3xl p-7 transition-shadow duration-300 hover:shadow-lg hover:shadow-violet-500/10 md:p-8"
              >
                <span
                  className="font-display text-4xl leading-none text-violet-400/30 transition-colors group-hover:text-violet-500/50 dark:text-violet-400/25"
                  aria-hidden
                >
                  &ldquo;
                </span>
                <blockquote className="-mt-2 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                  {q.quote}
                </blockquote>
                <figcaption className="mt-6 border-t border-slate-200/80 pt-5 dark:border-slate-700/70">
                  <p className="font-semibold text-aura-ink dark:text-slate-100">{q.name}</p>
                  <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    {q.meta}
                  </p>
                </figcaption>
              </motion.figure>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div className="glass-panel-lg rounded-3xl p-8 md:p-10">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-violet-700 dark:text-violet-300">
                Measurable signal
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-aura-ink dark:text-slate-100">
                Built to show improvement.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                InterviewAI focuses on the metrics that actually change outcomes: clarity, pacing, fillers,
                and delivery consistency.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {OUTCOMES.map((m, i) => (
                  <div
                    key={m.k}
                    className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200/80 hover:shadow-md dark:border-slate-700/70 dark:bg-slate-900/55 dark:hover:border-violet-500/40"
                  >
                    <span
                      className={`absolute inset-x-0 top-0 h-1 ${METRIC_ACCENTS[i % METRIC_ACCENTS.length]}`}
                      aria-hidden
                    />
                    <div className="font-display text-2xl font-bold text-aura-ink dark:text-slate-100">
                      {m.v}
                    </div>
                    <div className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {m.k}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/70 p-5 text-sm text-slate-600 dark:border-slate-700/70 dark:bg-slate-900/55 dark:text-slate-300">
                <span className="font-semibold text-aura-ink dark:text-slate-100">Best practice:</span> do 3
                reps, export the PDF, then rehearse the “top 2 fixes” until your score stabilizes.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
