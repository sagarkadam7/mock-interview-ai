import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function NotFoundPage() {
  const { user } = useAuth();

  return (
    <div className="page-shell flex min-h-[min(100vh,880px)] flex-col items-center justify-center py-20 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-10 text-center shadow-[0_32px_64px_-24px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-slate-200/80 backdrop-blur-2xl dark:border-slate-700/60 dark:bg-slate-900/55 dark:shadow-[0_32px_64px_-24px_rgba(0,0,0,0.45)] dark:ring-slate-700/50 md:p-12"
        role="status"
        aria-label="Page not found"
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-aura-coral/25 to-aura-violet/20 blur-3xl dark:from-aura-coral/15 dark:to-aura-violet/15"
          aria-hidden
        />
        <div className="relative z-10">
          <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">404</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">This page doesn’t exist</h1>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            The link may be broken, or the page was moved. Head back home and keep practicing.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/" className="no-underline">
              <span className="btn-cta inline-flex w-full justify-center px-8 py-3.5 sm:w-auto">Back to home</span>
            </Link>
            {user ? (
              <Link to="/dashboard" className="no-underline">
                <span className="btn-outline inline-flex w-full justify-center px-8 py-3.5 sm:w-auto">Dashboard</span>
              </Link>
            ) : (
              <Link to="/login" className="no-underline">
                <span className="btn-outline inline-flex w-full justify-center px-8 py-3.5 sm:w-auto">Sign in</span>
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
