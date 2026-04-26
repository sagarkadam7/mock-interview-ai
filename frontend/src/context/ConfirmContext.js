import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ConfirmContext = createContext(null);

/**
 * @param {string} message
 * @param {{ variant?: 'default' | 'danger', confirmLabel?: string, cancelLabel?: string, title?: string }} [options]
 * @returns {Promise<boolean>}
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const cancelButtonRef = useRef(null);

  const confirm = useCallback((message, options = {}) => {
    const {
      variant = "default",
      confirmLabel = "Confirm",
      cancelLabel = "Cancel",
      title = "Are you sure?",
    } = options;
    return new Promise((resolve) => {
      setState({ message, resolve, variant, confirmLabel, cancelLabel, title });
    });
  }, []);

  const close = useCallback((result) => {
    setState((s) => {
      if (s?.resolve) s.resolve(result);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e) => {
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [state, close]);

  useLayoutEffect(() => {
    if (!state) return;
    cancelButtonRef.current?.focus();
  }, [state]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            key="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              className="absolute inset-0 cursor-default bg-slate-900/40 backdrop-blur-[2px] dark:bg-black/55"
              onClick={() => close(false)}
              aria-label="Close dialog"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white/98 shadow-lux-lg ring-1 ring-white/80 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/95 dark:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.55)] dark:ring-slate-800/50"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300/80 to-transparent dark:via-slate-500/40" />
              <div className="border-b border-slate-100 px-6 py-5 dark:border-slate-800/90">
                <h2 id="confirm-dialog-title" className="text-lg font-semibold tracking-tight text-aura-ink" aria-describedby="confirm-dialog-message">
                  {state.title}
                </h2>
              </div>
              <p id="confirm-dialog-message" className="px-6 py-5 text-[15px] leading-relaxed text-aura-muted">
                {state.message}
              </p>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800/90 dark:bg-slate-950/80 sm:flex-row sm:justify-end sm:gap-3">
                <button ref={cancelButtonRef} type="button" onClick={() => close(false)} className="btn-outline w-full px-6 py-3 text-sm sm:w-auto">
                  {state.cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={() => close(true)}
                  className={
                    state.variant === "danger"
                      ? "inline-flex w-full items-center justify-center rounded-full border border-rose-600 bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-[transform,background-color,box-shadow] duration-250 ease-out-expo hover:bg-rose-500 active:scale-[0.98] sm:w-auto"
                      : "btn-primary w-full px-6 py-3 text-sm sm:w-auto"
                  }
                >
                  {state.confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
