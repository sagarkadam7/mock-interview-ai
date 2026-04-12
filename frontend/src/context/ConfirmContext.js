import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const ConfirmContext = createContext(null);

/**
 * @param {string} message
 * @param {{ variant?: 'default' | 'danger', confirmLabel?: string, cancelLabel?: string, title?: string }} [options]
 * @returns {Promise<boolean>}
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);

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
    return () => window.removeEventListener("keydown", onKey);
  }, [state, close]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-sm"
            onClick={() => close(false)}
            aria-label="Close dialog"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-enterprise">
            <div className="border-b border-white/[0.08] px-6 py-4">
              <h2 id="confirm-dialog-title" className="text-base font-semibold text-white">
                {state.title}
              </h2>
            </div>
            <p className="px-6 py-4 text-sm leading-relaxed text-aura-muted">{state.message}</p>
            <div className="flex justify-end gap-3 border-t border-white/[0.08] bg-black/40 px-6 py-4">
              <button
                type="button"
                onClick={() => close(false)}
                className="btn-outline px-5 py-2.5 text-sm"
              >
                {state.cancelLabel}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={
                  state.variant === "danger"
                    ? "inline-flex items-center justify-center rounded-lg border border-rose-900/50 bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500"
                    : "btn-primary px-5 py-2.5 text-sm"
                }
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}
