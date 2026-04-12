import React from "react";
import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      containerClassName="!top-20"
      toastOptions={{
        duration: 4000,
        className:
          "!bg-zinc-950 !text-white !border !border-white/10 !rounded-xl !shadow-enterprise !px-4 !py-3 !text-sm !font-medium !max-w-md",
        iconTheme: {
          primary: "#9D50BB",
          secondary: "#000000",
        },
        style: {
          boxShadow: "0 8px 24px -8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
        },
        error: {
          iconTheme: { primary: "#f87171", secondary: "#000000" },
          className:
            "!bg-zinc-950 !text-white !border !border-rose-900/45 !rounded-xl !shadow-enterprise !px-4 !py-3 !text-sm !font-medium !max-w-md",
        },
        success: {
          iconTheme: { primary: "#34d399", secondary: "#000000" },
          className:
            "!bg-zinc-950 !text-white !border !border-emerald-900/35 !rounded-xl !shadow-enterprise !px-4 !py-3 !text-sm !font-medium !max-w-md",
        },
      }}
    />
  );
}
