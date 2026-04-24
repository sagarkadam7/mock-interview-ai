import React from "react";
import { motion } from "framer-motion";
import { COMPARISON_ROWS } from "../../data/marketing";

// Three-way comparison: InterviewAI vs Generic AI chatbot vs Human coach.
// Supports booleans, literal strings, and a highlighted "us" column.
function Cell({ value, tone = "default" }) {
  if (typeof value === "boolean") {
    return (
      <div className="flex justify-center py-1">
        {value ? (
          <span
            className={
              tone === "primary"
                ? "inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_6px_16px_-4px_rgba(16,185,129,0.45)]"
                : "inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-950/55 dark:text-emerald-300 dark:ring-emerald-800/60"
            }
            title="Yes"
            aria-label="Yes"
          >
            ✓
          </span>
        ) : (
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-600"
            title="No"
            aria-label="No"
          >
            —
          </span>
        )}
      </div>
    );
  }
  // Literal strings get a neutral pill so they read as nuanced states.
  return (
    <div className="flex justify-center py-1">
      <span
        className={
          tone === "primary"
            ? "inline-flex items-center rounded-full bg-violet-600 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm"
            : "inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        }
      >
        {value}
      </span>
    </div>
  );
}

export default function ComparisonSection() {
  return (
    <section id="compare" className="relative py-24 md:py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[min(80%,480px)] -translate-y-1/2 bg-gradient-to-r from-violet-50/40 via-transparent to-orange-50/40 blur-3xl dark:from-violet-950/30 dark:to-orange-950/20"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <div className="section-eyebrow mx-auto mb-4">Why not a chatbot or a coach</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">
            The only tool built for the <span className="italic text-gradient">whole loop</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Generic chatbots answer questions. Human coaches cost $120/hr and can't see your delivery. InterviewAI
            combines both — resume-aware questions, live analytics, and 24/7 availability.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-xl shadow-slate-900/5 ring-1 ring-white/60 backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/70 dark:ring-slate-700/50"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/95 text-left dark:border-slate-700 dark:bg-slate-800/60">
                  <th className="px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 sm:px-6">
                    Capability
                  </th>
                  <th className="relative px-3 py-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300 sm:px-5">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden />
                      InterviewAI
                    </span>
                    <span className="pointer-events-none absolute inset-x-3 -bottom-px h-[2px] bg-gradient-to-r from-aura-coral via-fuchsia-500 to-aura-violet" aria-hidden />
                  </th>
                  <th className="px-3 py-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:px-5">
                    Generic AI chatbot
                  </th>
                  <th className="px-3 py-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:px-5">
                    Human coach
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr
                    key={row.label}
                    className={`border-b border-slate-100 last:border-0 dark:border-slate-800/90 ${
                      idx % 2 === 0 ? "bg-white dark:bg-slate-950/40" : "bg-slate-50/60 dark:bg-slate-900/40"
                    }`}
                  >
                    <td className="px-4 py-4 font-medium text-aura-ink dark:text-slate-100 sm:px-6">{row.label}</td>
                    <td className="relative px-3 py-3 sm:px-5">
                      {/* Subtle column tint to emphasise our column */}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-50/40 to-transparent dark:from-violet-950/20" aria-hidden />
                      <div className="relative">
                        <Cell value={row.us} tone="primary" />
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-5">
                      <Cell value={row.chatbot} />
                    </td>
                    <td className="px-3 py-3 sm:px-5">
                      <Cell value={row.coach} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
