import React from "react";
import { Link } from "react-router-dom";

const highlights = [
  { k: "7", label: "Tailored questions per session" },
  { k: "Live", label: "Speech & presence coaching" },
  { k: "PDF", label: "Export-ready reports" },
];

export default function AuthBrandPanel() {
  return (
    <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:px-14 xl:px-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-[20%] top-[-10%] h-[min(100%,560px)] w-[560px] rounded-full bg-gradient-to-br from-aura-coral/35 via-orange-500/10 to-transparent blur-[100px]" />
        <div className="absolute -right-[15%] bottom-[-5%] h-[min(100%,520px)] w-[520px] rounded-full bg-gradient-to-tl from-aura-violet/40 via-fuchsia-600/10 to-transparent blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <Link
        to="/"
        className="relative z-10 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 no-underline transition-colors hover:text-white"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-black text-white shadow-lg shadow-black/20 ring-1 ring-white/10 backdrop-blur-sm">
          IA
        </span>
        InterviewAI
      </Link>

      <div className="relative z-10 flex flex-1 flex-col justify-center py-16">
        <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-aura-coral/90">Candidate-grade practice</p>
        <h2 className="font-display text-4xl font-semibold leading-[1.15] tracking-tight text-white xl:text-[2.75rem]">
          Turn every answer into{" "}
          <span className="bg-gradient-to-r from-aura-coral to-violet-300 bg-clip-text text-transparent">signal</span>, not noise.
        </h2>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-slate-400">
          Structured scoring, camera-aware coaching, and questions grounded in your real experience — the stack serious candidates use before the real loop.
        </p>
        <ul className="mt-12 space-y-4 border-t border-white/10 pt-10">
          {highlights.map((h) => (
            <li key={h.label} className="flex items-baseline gap-4">
              <span className="font-sans text-lg font-bold tabular-nums text-white/90">{h.k}</span>
              <span className="text-sm text-slate-400">{h.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-xs text-slate-500">© {new Date().getFullYear()} InterviewAI</p>
    </div>
  );
}
