import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const badges = [
  { title: "TLS in production", desc: "Encrypt traffic end-to-end when deployed with HTTPS." },
  { title: "JWT sessions", desc: "Stateless auth tokens — no password in URLs." },
  { title: "Hashed passwords", desc: "bcrypt-strength storage; we never store plain text." },
  { title: "You own deletes", desc: "Remove interviews from your dashboard anytime." },
];

export default function SecuritySection() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent dark:via-slate-900/40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center md:mb-16">
          <div className="section-eyebrow mx-auto mb-4">Trust & security</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Built for real data</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] text-slate-600 dark:text-slate-400">
            Resumes are sensitive. We design the stack with least-privilege patterns — details in our{" "}
            <Link
              to="/privacy"
              className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900 dark:text-violet-400 dark:decoration-violet-500/50 dark:hover:text-violet-300"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="glass-panel rounded-2xl p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-md">✓</div>
              <h3 className="text-sm font-bold text-aura-ink">{b.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
