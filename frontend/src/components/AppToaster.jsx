import React from "react";
import { Toaster } from "react-hot-toast";

const toastBase =
  "!bg-white/95 !backdrop-blur-xl !text-aura-ink !border !border-slate-200/90 !rounded-2xl !px-4 !py-3.5 !text-sm !font-medium !max-w-md !shadow-[0_20px_40px_-12px_rgba(15,23,42,0.12),0_0_0_1px_rgba(255,255,255,0.8)_inset]";

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
          className: `${toastBase} !border-rose-200 !bg-rose-50/95 !animate-toast-in`,
        },
        success: {
          duration: 3600,
          iconTheme: { primary: "#059669", secondary: "#ffffff" },
          className: `${toastBase} !border-emerald-200 !bg-emerald-50/95 !animate-toast-in`,
        },
        loading: {
          iconTheme: { primary: "#FF7E5F", secondary: "#ffffff" },
          className: `${toastBase} !animate-toast-in`,
        },
      }}
    />
  );
}
