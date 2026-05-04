import React, { useEffect, useState } from "react";

/**
 * Non-blocking offline banner (global).
 * Shows when navigator goes offline, hides when online.
 */
export default function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-labelledby="offline-banner-title"
      className="fixed inset-x-3 bottom-20 z-[80] mx-auto max-w-md rounded-2xl border border-amber-200/80 bg-amber-50/95 px-4 py-3 text-amber-950 shadow-xl shadow-amber-900/5 backdrop-blur-md dark:border-amber-500/30 dark:bg-amber-950/90 dark:text-amber-50 sm:bottom-6"
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 ring-1 ring-amber-200/80 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-500/30"
          aria-hidden
        >
          !
        </span>
        <div className="min-w-0">
          <p id="offline-banner-title" className="text-sm font-bold">
            You’re offline
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-900/80 dark:text-amber-100/80">
            Some features won’t load until you reconnect. We’ll resume automatically when you’re back online.
          </p>
        </div>
      </div>
    </div>
  );
}

