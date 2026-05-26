import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PERSONAS } from "../../data/marketing";

// Each persona card gets its own accent, richer hover lift, and a role-specific CTA
// that carries a tracking query param so later analytics can segment by track.
const ACCENTS = [
  { ring: "hover:ring-aura-coral/40", badge: "bg-aura-coral/10 text-aura-coral", glow: "from-aura-coral/25" },
  { ring: "hover:ring-aura-violet/40", badge: "bg-aura-violet/10 text-aura-violet", glow: "from-aura-violet/25" },
  { ring: "hover:ring-sky-500/40", badge: "bg-sky-500/10 text-sky-600 dark:text-sky-300", glow: "from-sky-500/25" },
];

export default function PersonasSection() {
  return (
    <section
      id="personas"
      className="relative overflow-hidden border-y border-slate-200/80 bg-white py-24 dark:border-slate-800/80 dark:bg-slate-950 md:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] dark:opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.35) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-8 h-[420px] opacity-75 dark:opacity-30"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='920' height='420' viewBox='0 0 920 420' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%235b21b6' stroke-opacity='.11' stroke-width='1.3'%3E%3Cpath d='M144 300c30-70 92-110 158-110s128 40 158 110'/%3E%3Ccircle cx='302' cy='132' r='58'/%3E%3Cpath d='M530 302c34-76 102-120 174-120s140 44 174 120'/%3E%3Ccircle cx='704' cy='116' r='64'/%3E%3C/g%3E%3Cg fill='%23e85547' fill-opacity='.13'%3E%3Ccircle cx='214' cy='250' r='22'/%3E%3Ccircle cx='812' cy='242' r='24'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "min(920px, 118vw) auto",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center md:mb-16">
          <div className="section-eyebrow mx-auto mb-4">Who it's for</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">
            Built for serious loops
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Same product surface — different stories. The model adapts to the role you paste, so each track feels
            like the real panel.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {PERSONAS.map((p, i) => {
            const a = ACCENTS[i % ACCENTS.length];
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-sm ring-1 ring-white/60 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:ring-2 ${a.ring} dark:border-slate-700/70 dark:bg-slate-900/70 dark:ring-slate-700/50`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-4 font-display text-7xl font-bold leading-none text-slate-100 transition-colors duration-300 group-hover:text-violet-100/80 dark:text-slate-800/80 dark:group-hover:text-violet-900/40"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                {/* Ambient corner glow emerges on hover */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${a.glow} to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100`}
                />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/90 bg-slate-50 text-xl text-aura-ink shadow-inner dark:border-slate-700 dark:bg-slate-800/80">
                    {p.icon}
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-aura-ink dark:text-slate-100">{p.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{p.desc}</p>

                  {p.outcomes?.length ? (
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                      {p.outcomes.map((o) => (
                        <li
                          key={o}
                          className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${a.badge}`}
                        >
                          {o}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {p.cta ? (
                  <div className="relative mt-auto border-t border-slate-200/80 pt-5 dark:border-slate-700/70">
                    <Link
                      to={p.cta.to}
                      className="group/cta inline-flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-50/80 px-4 py-3 text-sm font-bold text-aura-ink no-underline transition-colors hover:bg-violet-50 hover:text-aura-violet dark:bg-slate-800/60 dark:text-slate-100 dark:hover:bg-violet-950/35 dark:hover:text-violet-300"
                    >
                      {p.cta.label}
                      <span
                        aria-hidden
                        className="transition-transform duration-250 ease-out group-hover/cta:translate-x-1"
                      >
                        →
                      </span>
                    </Link>
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
