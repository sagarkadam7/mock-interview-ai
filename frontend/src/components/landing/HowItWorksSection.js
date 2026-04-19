import React from "react";
import { motion } from "framer-motion";
import { HOW_STEPS } from "../../data/marketing";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-y border-slate-200/80 bg-gradient-to-b from-white via-slate-50/50 to-white py-24 dark:border-slate-800/80 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center md:mb-20">
          <div className="section-eyebrow mx-auto mb-4">How it works</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">
            From resume to <span className="text-gradient italic">report</span> in one flow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            No downloads. No question banks. A single pipeline built for depth — the same pattern top candidates use to debrief after every round.
          </p>
        </div>

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
              <div className="glass-panel-lg relative h-full overflow-hidden rounded-2xl p-6 md:p-7">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">{step.n}</span>
                <h3 className="mt-3 text-lg font-bold tracking-tight text-aura-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
                {i < HOW_STEPS.length - 1 && (
                  <div
                    className="pointer-events-none absolute -right-3 top-1/2 hidden h-px w-6 -translate-y-1/2 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-600 lg:block"
                    aria-hidden
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
