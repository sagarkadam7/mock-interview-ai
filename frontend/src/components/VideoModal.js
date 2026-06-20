import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function VideoModal({ open, onClose, src, title = "Product walkthrough" }) {
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!open) {
      setVideoReady(false);
      return undefined;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close video"
            className="fixed inset-0 z-[90] cursor-default bg-slate-900/45 backdrop-blur-sm dark:bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed left-1/2 top-1/2 z-[91] w-[min(92vw,960px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-700/70 dark:bg-slate-950"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => setVideoReady(true)}
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-slate-800/80">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                {title}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                Close
              </button>
            </div>
            <div className="relative bg-black" style={{ aspectRatio: "16 / 9" }}>
              {src && videoReady ? (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={src}
                  controls
                  autoPlay
                  playsInline
                  preload="metadata"
                  onEnded={() => onClose?.()}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center">
                  <span
                    className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-violet-400"
                    aria-hidden
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modal, document.body);
}
