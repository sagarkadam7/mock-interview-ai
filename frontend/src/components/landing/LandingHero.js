import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const statRows = [
  { v: "7", l: "Tailored Qs" },
  { v: "Live", l: "Speech + gaze" },
  { v: "PDF", l: "Export reports" },
];

const waveformHeights = [28, 44, 36, 52, 40, 64, 48, 72, 56, 80, 60, 88, 68, 92, 76, 100, 70, 85, 58, 78];

function HeroShowcase({ reduceMotion }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.85, ease: [0.16, 1, 0.3, 1], delay: reduceMotion ? 0 : 0.12 }}
      className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg xl:max-w-xl"
    >
      <div
        className={
          reduceMotion
            ? ""
            : "pointer-events-none absolute -inset-10 rounded-[2.5rem] bg-gradient-to-br from-aura-coral/20 via-transparent to-aura-violet/15 blur-3xl animate-hero-breathe"
        }
        aria-hidden
      />
      <div className="relative rounded-[1.75rem] border border-slate-200/90 bg-white/70 p-1 shadow-lux-lg backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-900/60">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/90 to-white ring-1 ring-slate-900/[0.04] dark:from-slate-800/90 dark:to-slate-900 dark:ring-white/[0.06]">
          <div className="flex items-center gap-2 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-700/80 dark:bg-slate-800/80">
            <div className="flex gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-300/50" />
            </div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Live session preview</span>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Composite signal</p>
                <p className="mt-1 text-sm font-semibold text-aura-ink">Answer quality · pace · gaze</p>
              </div>
              <div className="rounded-full bg-gradient-to-br from-aura-coral via-aura-violet to-aura-coral p-[2.5px] shadow-md shadow-aura-violet/15">
                <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-white font-display text-2xl font-semibold tabular-nums tracking-tight text-aura-ink dark:bg-slate-900">
                  8.6
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <span>Transcript energy</span>
                <span className="text-emerald-600/90">Streaming</span>
              </div>
              <div
                className="flex h-20 items-end justify-between gap-0.5 rounded-xl border border-slate-200/80 bg-slate-50/50 px-2 pb-2 pt-4 dark:border-slate-600/80 dark:bg-slate-800/50"
                role="img"
                aria-label="Abstract waveform visualization"
              >
                {waveformHeights.map((pct, i) => (
                  <div
                    key={i}
                    className="min-w-[3px] flex-1 rounded-full bg-gradient-to-t from-aura-violet/25 via-aura-coral/50 to-aura-coral/90 opacity-90"
                    style={{ height: `${pct}%` }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { t: "Gaze on camera", s: "78%" },
                { t: "Pace", s: "142 wpm" },
                { t: "Fillers", s: "Low" },
              ].map((chip) => (
                <span
                  key={chip.t}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm dark:border-slate-600/80 dark:bg-slate-800/90 dark:text-slate-200"
                >
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{chip.t}</span>
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-aura-ink dark:bg-slate-700 dark:text-slate-100">{chip.s}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-6 top-1/4 hidden h-24 w-24 rounded-2xl border border-slate-200/60 bg-white/40 shadow-lux backdrop-blur-md dark:border-slate-600/50 dark:bg-slate-900/40 lg:block"
          animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
}

export default function LandingHero({ user }) {
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const onMove = (e) => {
      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      hero.style.setProperty("--mx", `${x * 100}%`);
      hero.style.setProperty("--my", `${y * 100}%`);
    };
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reduceMotion ? { duration: 0.01 } : { staggerChildren: 0.09, delayChildren: 0.06 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.15 : 0.55, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-center overflow-hidden px-5 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:min-h-[calc(100vh-3.5rem)] lg:pb-32 lg:pt-24"
    >
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse 900px 640px at var(--mx,50%) var(--my,42%), rgba(255,126,95,0.18), transparent 58%),
            radial-gradient(ellipse 520px 480px at 82% 18%, rgba(157,80,187,0.11), transparent 50%),
            radial-gradient(ellipse 480px 420px at 12% 88%, rgba(157,80,187,0.07), transparent 52%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.028) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_50%_100%,rgba(255,255,255,0.92),transparent_55%)] dark:bg-[radial-gradient(ellipse_85%_65%_at_50%_100%,rgba(15,23,42,0.5),transparent_55%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-aura-page to-transparent" aria-hidden />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:pr-4 lg:text-left"
        >
          <motion.div variants={item} className="mb-6 inline-flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-600 shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_12px_32px_-14px_rgba(15,23,42,0.1)] backdrop-blur-md ring-1 ring-white/80 dark:border-slate-600/80 dark:bg-slate-900/80 dark:text-slate-300 dark:shadow-none dark:ring-slate-700/60"
              role="status"
            >
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
              </span>
              Live · Gemini-powered coaching
            </span>
          </motion.div>

          <motion.p
            variants={item}
            className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500 sm:text-[11px] sm:tracking-[0.38em]"
          >
            Interview intelligence
          </motion.p>

          <motion.h1
            variants={item}
            className="font-sans text-[2.65rem] font-semibold leading-[0.98] tracking-[-0.04em] text-aura-ink sm:text-5xl sm:tracking-[-0.035em] md:text-6xl md:leading-[0.97] lg:text-[3.35rem] xl:text-[4rem]"
          >
            Craft your
            <br />
            <span className="mt-1 inline-block font-display text-[1.06em] font-semibold italic tracking-[-0.02em] text-gradient drop-shadow-[0_2px_24px_rgba(157,80,187,0.12)] sm:mt-0 sm:text-[1.05em]">
              interview edge
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-8 max-w-lg text-[15px] leading-[1.65] text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-relaxed lg:mx-0 lg:max-w-xl"
          >
            The mock interview stack for candidates who want <span className="font-medium text-slate-800 dark:text-slate-200">signal, not scripts</span> —
            structured AI scoring, camera-aware coaching, and questions grounded in your real experience.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
            <Link to={user ? "/dashboard" : "/register"} className="w-full no-underline sm:w-auto">
              <span className="btn-cta w-full justify-center px-10 py-4 text-[15px] shadow-[0_14px_44px_-10px_rgba(15,23,42,0.35)] sm:w-auto sm:px-11">
                {user ? "Go to dashboard" : "Start free"} <span aria-hidden>→</span>
              </span>
            </Link>
            {!user && (
              <Link to="/login" className="w-full no-underline sm:w-auto">
                <span className="btn-secondary w-full justify-center py-4 sm:inline-flex sm:w-auto sm:px-8">Sign in</span>
              </Link>
            )}
            {user && (
              <Link to="/interview/new" className="w-full no-underline sm:w-auto">
                <span className="btn-outline w-full justify-center py-4 font-semibold sm:inline-flex sm:w-auto sm:px-8">New interview</span>
              </Link>
            )}
          </motion.div>

          <motion.div
            variants={item}
            className="mt-14 w-full max-w-xl sm:mt-16 lg:max-w-none"
          >
            <div className="grid grid-cols-3 divide-x divide-slate-200/80 rounded-2xl border border-slate-200/80 bg-white/55 py-5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset] backdrop-blur-md ring-1 ring-white/60 dark:divide-slate-700 dark:border-slate-700/80 dark:bg-slate-900/50 dark:shadow-none dark:ring-slate-700/50 sm:py-6">
              {statRows.map((row) => (
                <div key={row.l} className="flex flex-col items-center px-1 sm:px-2">
                  <div className="font-display text-2xl font-semibold tabular-nums text-aura-ink sm:text-3xl">{row.v}</div>
                  <div className="mt-2 max-w-[6.5rem] text-[9px] font-semibold uppercase leading-snug tracking-[0.2em] text-slate-500 dark:text-slate-400 sm:max-w-[10rem] sm:text-[10px] sm:tracking-[0.24em]">
                    {row.l}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <div className="lg:col-span-6">
          <HeroShowcase reduceMotion={reduceMotion} />
        </div>
      </div>
    </section>
  );
}
