import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const rows = [
  { keys: "⌘ / Ctrl + Enter", desc: "Submit your answer (when not typing in a text field)" },
  { keys: "Esc", desc: "Close this panel" },
];

export default function InterviewKeyboardHelp({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="kbd-help"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kbd-help-title"
          className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button type="button" className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" aria-label="Close" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white/98 p-6 shadow-lux-lg dark:border-slate-700 dark:bg-slate-900/95"
          >
            <h2 id="kbd-help-title" className="font-display text-lg font-semibold tracking-tight text-aura-ink dark:text-slate-100">
              Session shortcuts
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Built for fast reps — fewer clicks between questions.</p>
            <ul className="mt-5 space-y-3">
              {rows.map((r) => (
                <li key={r.keys} className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">{r.keys}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{r.desc}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="btn-primary mt-6 w-full py-2.5 text-sm" onClick={onClose}>
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
