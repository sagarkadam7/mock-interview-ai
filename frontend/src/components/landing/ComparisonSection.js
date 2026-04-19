import React from "react";
import { motion } from "framer-motion";
import { COMPARISON_ROWS } from "../../data/marketing";

function YesNo({ value }) {
  if (typeof value === "boolean") {
    return (
      <div className="flex justify-center py-1">
        {value ? (
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200/80"
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
  return <p className="py-1 text-center text-sm font-medium text-slate-600 dark:text-slate-400">{value}</p>;
}

export default function ComparisonSection() {
  return (
    <section className="relative py-24 md:py-28">
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-[min(80%,480px)] -translate-y-1/2 bg-gradient-to-r from-violet-50/40 via-transparent to-orange-50/40 blur-3xl dark:from-violet-950/30 dark:to-orange-950/20" aria-hidden />
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <div className="section-eyebrow mx-auto mb-4">Why not generic banks?</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Signal vs. noise</h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Static question lists can’t see your resume. InterviewAI is built for{" "}
            <strong className="font-semibold text-aura-ink">contextual</strong> practice and{" "}
            <strong className="font-semibold text-aura-ink">measurable</strong> delivery.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-panel-lg overflow-hidden rounded-2xl p-1"
        >
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[320px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/95 text-left dark:border-slate-700 dark:bg-slate-800/60">
                  <th className="px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 sm:px-6">Capability</th>
                  <th className="px-3 py-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700 sm:px-5">
                    InterviewAI
                  </th>
                  <th className="px-3 py-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 sm:px-5">
                    Typical banks
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 bg-white last:border-0 dark:border-slate-800 dark:bg-slate-900/40">
                    <td className="px-4 py-4 font-medium text-aura-ink sm:px-6">{row.label}</td>
                    <td className="px-3 py-3 sm:px-5">
                      <YesNo value={row.us} />
                    </td>
                    <td className="px-3 py-3 sm:px-5">
                      <YesNo value={row.them} />
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
