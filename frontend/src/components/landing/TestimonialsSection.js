import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TESTIMONIALS } from "../../data/marketing";

// Deterministic avatar tone per name so quotes feel identifiable.
const AVATAR_TONES = [
  "from-violet-500 to-fuchsia-500",
  "from-aura-coral to-amber-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-orange-500",
];

const AUTO_ADVANCE_MS = 7000;

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function StarRating({ value = 5 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < value ? "text-amber-400" : "text-slate-300"} aria-hidden>
          ★
        </span>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(0);

  const go = useCallback(
    (next) => {
      const total = TESTIMONIALS.length;
      setIdx(((next % total) + total) % total);
    },
    []
  );

  const next = useCallback(() => go(idx + 1), [go, idx]);
  const prev = useCallback(() => go(idx - 1), [go, idx]);

  // Auto-advance unless user is hovering or focus is within the carousel.
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), AUTO_ADVANCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [paused, idx]);

  // Global keyboard shortcuts while carousel is on screen.
  const handleKey = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  const current = TESTIMONIALS[idx];
  const tone = AVATAR_TONES[idx % AVATAR_TONES.length];

  return (
    <section className="relative py-24 md:py-28" aria-labelledby="testimonials-heading">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <div className="section-eyebrow mx-auto mb-4">Proof</div>
          <h2 id="testimonials-heading" className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">
            What candidates say
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Early users from campus and internship loops — anonymized quotes, real outcomes.
          </p>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Candidate testimonials"
          tabIndex={0}
          onKeyDown={handleKey}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 ring-1 ring-white/70 backdrop-blur-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 dark:border-slate-700/70 dark:bg-slate-900/70 dark:ring-slate-700/50 md:p-14"
        >
          {/* Ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-aura-coral/20 to-aura-violet/15 blur-3xl"
          />

          <div className="relative min-h-[220px]" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.figure
                key={current.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-6 md:flex-row md:items-start"
              >
                <div className="flex shrink-0 items-center gap-3 md:flex-col md:items-start md:gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tone} text-base font-black text-white shadow-lg`} aria-hidden>
                    {initials(current.name)}
                  </div>
                  <div className="md:mt-2">
                    <p className="font-semibold text-aura-ink dark:text-slate-100">{current.name}</p>
                    <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      {current.role}
                    </p>
                    <div className="mt-2"><StarRating value={5} /></div>
                  </div>
                </div>
                <blockquote className="font-display text-xl font-medium italic leading-snug text-aura-ink dark:text-slate-100 md:text-2xl">
                  <span aria-hidden className="mr-1 text-3xl text-aura-violet/40">&ldquo;</span>
                  {current.quote}
                  <span aria-hidden className="ml-1 text-3xl text-aura-violet/40">&rdquo;</span>
                </blockquote>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-between">
            <div className="flex gap-2" role="tablist" aria-label="Select testimonial">
              {TESTIMONIALS.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={`Testimonial ${i + 1} of ${TESTIMONIALS.length}`}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 ${
                    i === idx ? "w-8 bg-aura-violet" : "w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous testimonial"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-700 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:text-violet-300"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next testimonial"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-700 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:text-violet-300"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden>
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
