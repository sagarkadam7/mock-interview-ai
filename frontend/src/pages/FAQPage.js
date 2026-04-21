import React from "react";
import { Link } from "react-router-dom";
import FAQSection from "../components/landing/FAQSection";
import SiteFooter from "../components/SiteFooter";

export default function FAQPage() {
  return (
    <div className="min-h-screen">
      <div className="page-shell max-w-5xl pb-8 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 no-underline hover:text-aura-ink dark:text-slate-400 dark:hover:text-slate-100">
          ← Back to home
        </Link>
      </div>
      <FAQSection />
      <div className="mx-auto max-w-3xl px-6 pb-12 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Still stuck? Re-read our{" "}
          <Link
            to="/privacy"
            className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 dark:text-violet-400 dark:decoration-violet-500/50 dark:hover:text-violet-300"
          >
            Privacy
          </Link>{" "}
          page or open a support thread from your institution — we’re small but we care about clarity.
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}
