import React from "react";

/** Lightweight placeholder while lazy landing sections load. */
export default function LandingSectionSkeleton({ minHeight = 320 }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16" aria-hidden style={{ minHeight }}>
      <div className="mx-auto mb-8 h-4 w-28 rounded-full bg-slate-200/90 dark:bg-slate-800/80" />
      <div className="mx-auto mb-4 h-9 w-[min(100%,28rem)] rounded-xl bg-slate-200/90 dark:bg-slate-800/80" />
      <div className="mx-auto h-4 w-[min(100%,36rem)] rounded-lg bg-slate-100/90 dark:bg-slate-800/60" />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-3xl bg-slate-100/90 dark:bg-slate-800/50" />
        <div className="h-48 rounded-3xl bg-slate-100/90 dark:bg-slate-800/50" />
      </div>
    </div>
  );
}
