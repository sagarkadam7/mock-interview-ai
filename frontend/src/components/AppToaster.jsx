import React from "react";
import { Toaster } from "react-hot-toast";

const toastBase =
  "!bg-white/95 !backdrop-blur-xl !text-aura-ink !border !border-slate-200/90 !rounded-2xl !px-4 !py-3.5 !text-sm !font-medium !max-w-md !shadow-[0_20px_40px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset] dark:!bg-slate-900/95 dark:!text-slate-100 dark:!border-slate-700/90 dark:!shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset]";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      containerClassName="!top-[4.5rem] sm:!top-20"
      gutter={12}
      toastOptions={{
        duration: 4200,
        className: `${toastBase} !animate-toast-in`,
        iconTheme: {
          primary: "#9D50BB",
          secondary: "#ffffff",
        },
        style: {
          transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease",
        },
        error: {
          duration: 5200,
          iconTheme: { primary: "#e11d48", secondary: "#ffffff" },
          className: `${toastBase} !border-rose-200 !bg-rose-50/95 !text-rose-950 !animate-toast-in dark:!border-rose-500/40 dark:!bg-rose-950/90 dark:!text-rose-50`,
        },
        success: {
          duration: 3600,
          iconTheme: { primary: "#059669", secondary: "#ffffff" },
          className: `${toastBase} !border-emerald-200 !bg-emerald-50/95 !text-emerald-950 !animate-toast-in dark:!border-emerald-500/35 dark:!bg-emerald-950/90 dark:!text-emerald-50`,
        },
        loading: {
          iconTheme: { primary: "#FF7E5F", secondary: "#ffffff" },
          className: `${toastBase} !animate-toast-in`,
        },
      }}
    />
  );
}
