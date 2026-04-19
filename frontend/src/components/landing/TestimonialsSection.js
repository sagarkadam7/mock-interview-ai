import React from "react";
import { motion } from "framer-motion";
import { TESTIMONIALS } from "../../data/marketing";

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <div className="section-eyebrow mx-auto mb-4">Proof</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">What candidates say</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-slate-600 dark:text-slate-400">Early users from campus and internship loops — anonymized quotes.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="glass-panel-lg flex h-full flex-col rounded-2xl p-8"
            >
              <blockquote className="flex-1 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">“{t.quote}”</blockquote>
              <figcaption className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-700/80">
                <div className="font-semibold text-aura-ink">{t.name}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">{t.role}</div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
