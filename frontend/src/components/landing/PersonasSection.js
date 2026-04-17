import React from "react";
import { motion } from "framer-motion";
import { PERSONAS } from "../../data/marketing";

export default function PersonasSection() {
  return (
    <section className="border-y border-slate-200/80 bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center md:mb-16">
          <div className="section-eyebrow mx-auto mb-4">Who it’s for</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Built for serious loops</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] text-slate-600">Same product surface — different stories. The model adapts to the role you paste.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {PERSONAS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-panel-lg rounded-2xl p-8"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl text-aura-ink shadow-inner">
                {p.icon}
              </div>
              <h3 className="text-lg font-bold tracking-tight text-aura-ink">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
