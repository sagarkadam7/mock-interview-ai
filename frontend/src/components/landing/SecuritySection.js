import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const privacyPrinciples = [
  { title: "Enterprise-grade privacy", desc: "Interview data is handled with strict access boundaries and secure-by-default controls." },
  { title: "Candidate data ownership", desc: "You can remove your interview records directly from your dashboard whenever you choose." },
  { title: "Policy transparency", desc: "Our commitments are documented clearly so teams can evaluate compliance quickly." },
];

const technicalControls = [
  "TLS encryption in production",
  "JWT-based authenticated sessions",
  "bcrypt-hashed password storage",
  "Least-privilege service design",
];

export default function SecuritySection() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-transparent dark:via-slate-900/40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center md:mb-16">
          <div className="section-eyebrow mx-auto mb-4">Trust & privacy</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Enterprise-Grade Privacy</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Candidate interview prep data is sensitive. InterviewAI is designed to protect it with clear controls, transparent policies, and secure defaults.
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
              className="glass-panel rounded-2xl p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-md dark:bg-gradient-to-br dark:from-violet-600/90 dark:to-aura-coral/80 dark:ring-1 dark:ring-white/10">✓</div>
              <h3 className="text-sm font-bold text-aura-ink">{b.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{b.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/60">
          <details>
            <summary className="cursor-pointer list-none text-sm font-semibold text-aura-ink">
              View security controls
            </summary>
            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {technicalControls.map((control) => (
                <li key={control}>• {control}</li>
              ))}
            </ul>
          </details>
        </div>
      </div>
    </section>
  );
}
