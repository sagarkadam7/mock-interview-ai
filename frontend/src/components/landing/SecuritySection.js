import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const privacyPrinciples = [
  {
    title: "Enterprise-grade privacy",
    desc: "Interview data is handled with strict access boundaries and secure-by-default controls.",
    icon: "🔐",
    accent: "from-violet-500/20 to-indigo-500/10",
  },
  {
    title: "Candidate data ownership",
    desc: "You can remove your interview records directly from your dashboard whenever you choose.",
    icon: "👤",
    accent: "from-emerald-500/20 to-teal-500/10",
  },
  {
    title: "Policy transparency",
    desc: "Our commitments are documented clearly so teams can evaluate compliance quickly.",
    icon: "📋",
    accent: "from-aura-coral/20 to-amber-500/10",
  },
];

const technicalControls = [
  "TLS encryption in production",
  "JWT-based authenticated sessions",
  "bcrypt-hashed password storage",
  "Least-privilege service design",
];

export default function SecuritySection() {
  return (
    <section id="trust-privacy" className="relative scroll-mt-24 py-24 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent dark:via-slate-900/40"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center md:mb-16">
          <div className="section-eyebrow mx-auto mb-4">Trust & privacy</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">
            Enterprise-Grade Privacy
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Candidate interview prep data is sensitive. InterviewAI is designed to protect it with clear
            controls, transparent policies, and secure defaults.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
            Full policy details are available in our{" "}
            <Link
              to="/privacy"
              className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900 dark:text-violet-400 dark:decoration-violet-500/50 dark:hover:text-violet-300"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {privacyPrinciples.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="group glass-panel relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10"
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${b.accent} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
              />
              <div className="relative">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50 text-lg shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                  <span aria-hidden>{b.icon}</span>
                </div>
                <h3 className="text-sm font-bold text-aura-ink dark:text-slate-100">{b.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/60">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg text-sm font-semibold text-aura-ink outline-none transition-colors hover:text-violet-800 focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:text-violet-200 dark:focus-visible:ring-violet-500/50 dark:focus-visible:ring-offset-slate-900">
              <span>View security controls</span>
              <span
                className="text-slate-400 transition-transform duration-200 group-open:rotate-180"
                aria-hidden
              >
                ▼
              </span>
            </summary>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {technicalControls.map((control) => (
                <li
                  key={control}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2.5 text-sm leading-relaxed text-slate-600 dark:border-slate-700/70 dark:bg-slate-900/40 dark:text-slate-400"
                >
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    aria-hidden
                  >
                    ✓
                  </span>
                  {control}
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </section>
  );
}
