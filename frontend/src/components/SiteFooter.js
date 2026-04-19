import React from "react";
import { Link } from "react-router-dom";

const product = [
  { label: "Pricing", to: "/pricing" },
  { label: "FAQ", to: "/faq" },
  { label: "How it works", to: "/#how-it-works" },
];

const legal = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-aura-page dark:border-slate-800/80 dark:from-slate-950/90 dark:to-aura-page">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 no-underline transition-colors hover:text-aura-ink dark:text-slate-400 dark:hover:text-slate-100"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-aura-coral to-aura-violet text-xs font-black text-white shadow-lg shadow-aura-violet/20">
                IA
              </span>
              InterviewAI
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Mock interviews with resume-aware AI, live delivery analytics, and exportable reports — built for candidates who care about signal.
            </p>
          </div>
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Product</div>
            <ul className="mt-4 space-y-3">
              {product.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm font-medium text-slate-600 no-underline transition-colors hover:text-aura-ink dark:text-slate-400 dark:hover:text-slate-100">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Legal</div>
            <ul className="mt-4 space-y-3">
              {legal.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm font-medium text-slate-600 no-underline transition-colors hover:text-aura-ink dark:text-slate-400 dark:hover:text-slate-100">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-center dark:border-slate-800/80 sm:flex-row sm:text-left">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">© {new Date().getFullYear()} InterviewAI · All rights reserved</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Crafted for serious interview practice.</p>
        </div>
      </div>
    </footer>
  );
}
