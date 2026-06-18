import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAsymptoticProgress } from "../hooks/useAsymptoticProgress";

const STEPS = [
  { at: 0, label: "Reading your resume", detail: "Extracting experience, skills, and project signals" },
  { at: 22, label: "Parsing job context", detail: "Aligning role level and interview mode" },
  { at: 45, label: "Drafting tailored questions", detail: "Grounding prompts in your actual story" },
  { at: 68, label: "Calibrating difficulty", detail: "Matching seniority and persona settings" },
  { at: 86, label: "Polishing your question set", detail: "Seven questions, ready for rehearsal" },
  { at: 96, label: "Almost there", detail: "Final quality pass from the model" },
];

function stepForProgress(pct) {
  let current = STEPS[0];
  for (const step of STEPS) {
    if (pct >= step.at) current = step;
  }
  return current;
}

export default function InterviewGenerationLoader({ active, className = "" }) {
  const { progress, phase } = useAsymptoticProgress(active);
  const step = useMemo(() => stepForProgress(progress), [progress]);
  const [stepIndex, setStepIndex] = useState(0);
  const visible = active || phase !== "idle";

  useEffect(() => {
    const idx = STEPS.findIndex((s) => s.label === step.label);
    if (idx >= 0) setStepIndex(idx);
  }, [step.label]);

  useEffect(() => {
    if (!visible) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [visible]);

  if (!visible) return null;

  const showComplete = phase === "completing" || phase === "done" || progress >= 100;

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="interview-gen-loader-title"
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-md backdrop-saturate-150 dark:bg-black/65"
        aria-hidden
      />

      <motion.div
        role="status"
        aria-live="polite"
        aria-busy={!showComplete}
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        className={`relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-br from-white via-violet-50/40 to-orange-50/30 p-6 shadow-2xl shadow-violet-500/20 ring-1 ring-white/80 dark:border-violet-500/25 dark:from-slate-900/98 dark:via-violet-950/40 dark:to-slate-950 dark:shadow-violet-900/30 dark:ring-slate-800/60 sm:p-8 ${className}`}
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br from-aura-violet/15 to-aura-coral/10 blur-3xl dark:from-aura-violet/25 dark:to-aura-coral/15"
          aria-hidden
        />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
          {/* Circular progress ring */}
          <div className="relative mx-auto flex h-[88px] w-[88px] shrink-0 items-center justify-center sm:mx-0">
            <svg className="h-[88px] w-[88px] -rotate-90" viewBox="0 0 88 88" aria-hidden>
              <circle
                cx="44"
                cy="44"
                r="38"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-slate-200/90 dark:text-slate-700/80"
              />
              <motion.circle
                cx="44"
                cy="44"
                r="38"
                fill="none"
                stroke="url(#genLoaderGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 38}
                initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - Math.min(progress, 100) / 100) }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
              <defs>
                <linearGradient id="genLoaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e85547" />
                  <stop offset="50%" stopColor="#c026d3" />
                  <stop offset="100%" stopColor="#5b21b6" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute font-display text-2xl font-semibold tabular-nums tracking-tight text-aura-ink dark:text-slate-100">
              {showComplete ? "✓" : `${progress}%`}
            </span>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-violet-700 dark:text-violet-300">
              {showComplete ? "Ready" : "Building your session"}
            </p>
            <AnimatePresence mode="wait">
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.28 }}
              >
                <h3
                  id="interview-gen-loader-title"
                  className="mt-2 font-display text-xl font-semibold tracking-tight text-aura-ink dark:text-slate-100"
                >
                  {showComplete ? "Questions ready" : step.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {showComplete ? "Opening your interview room…" : step.detail}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Linear bar — reinforces perceived momentum */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                <span>Progress</span>
                <span className="tabular-nums">{Math.min(progress, 100)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200/90 dark:bg-slate-700/80">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-aura-coral via-fuchsia-500 to-aura-violet shadow-[0_0_12px_rgba(91,33,182,0.35)]"
                  initial={{ width: "0%" }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Step pills */}
            <ul className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start" aria-hidden>
              {STEPS.slice(0, 5).map((s, i) => (
                <li
                  key={s.label}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i <= stepIndex
                      ? "w-6 bg-gradient-to-r from-aura-coral to-aura-violet"
                      : "w-1.5 bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </ul>
          </div>
        </div>

        <p className="relative mt-5 text-center text-[11px] text-slate-500 dark:text-slate-500 sm:text-left">
          AI is tailoring seven questions to your resume — usually 10–25 seconds.
        </p>
      </motion.div>
    </motion.div>,
    document.body
  );
}
