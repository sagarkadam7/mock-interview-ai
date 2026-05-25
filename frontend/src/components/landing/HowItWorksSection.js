import React from "react";
import { motion } from "framer-motion";
import { HOW_STEPS } from "../../data/marketing";

const STEP_OUTPUTS = ["Role context", "Live answer", "Scorecard", "Next rep"];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="scroll-mt-28 border-y border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-white py-24 dark:border-slate-800/80 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center md:mb-20">
          <div className="section-eyebrow mx-auto mb-4">How it works</div>
          <h2 id="how-it-works-heading" className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">
            From resume to <span className="text-gradient italic">report</span> in one flow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            No downloads. No question banks. A single pipeline built for depth — the same pattern top candidates use to debrief after every round.
          </p>
        </div>

        <div className="relative">
          <motion.div
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[2.75rem] hidden h-px origin-left bg-gradient-to-r from-aura-coral/50 via-violet-400/60 to-aura-violet/50 lg:block"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                className="group relative"
              >
                <div className="glass-panel-lg relative h-full overflow-hidden rounded-2xl p-6 transition-shadow duration-300 ease-out group-hover:shadow-xl group-hover:shadow-violet-500/10 md:p-7">
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-200/80 bg-gradient-to-br from-white to-violet-50 font-mono text-[11px] font-bold text-violet-700 shadow-sm ring-2 ring-white dark:border-violet-500/40 dark:from-slate-800 dark:to-slate-900 dark:text-violet-200 dark:ring-slate-950"
                      aria-hidden
                    >
                      {step.n}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-aura-ink dark:text-slate-100">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/55 dark:text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-aura-coral" aria-hidden />
                    {STEP_OUTPUTS[i]}
                  </div>
                  {i < HOW_STEPS.length - 1 && (
                    <div
                      className="pointer-events-none absolute -right-3 top-12 hidden h-px w-6 bg-gradient-to-r from-violet-300/80 to-transparent dark:from-violet-600/60 lg:block"
                      aria-hidden
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
