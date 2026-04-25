import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close video"
            className="fixed inset-0 z-[90] cursor-default bg-slate-900/35 backdrop-blur-[2px] dark:bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Product video"
            className="fixed left-1/2 top-1/2 z-[91] w-[min(92vw,960px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700/70 dark:bg-slate-950"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Product walkthrough
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
            <div className="relative aspect-video bg-gradient-to-br from-slate-950 to-slate-900">
              <div className="absolute inset-0 grid place-items-center p-10 text-center">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                    Demo video placeholder
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">Add your walkthrough video URL</p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300/80">
                    Replace this panel with an embed or hosted MP4 when you’re ready. This keeps the UI/flow in place
                    without relying on third-party links.
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/15">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    Best practice: keep it under 90 seconds
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

