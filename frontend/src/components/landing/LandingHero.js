import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const statRows = [
  { v: "7", l: "Tailored Qs" },
  { v: "Live", l: "Speech + gaze" },
  { v: "PDF", l: "Export reports" },
];

const waveformHeights = [28, 44, 36, 52, 40, 64, 48, 72, 56, 80, 60, 88, 68, 92, 76, 100, 70, 85, 58, 78];

const proofAvatars = [
  { initials: "AR", tone: "from-violet-500 to-fuchsia-500" },
  { initials: "SK", tone: "from-aura-coral to-amber-500" },
  { initials: "MP", tone: "from-sky-500 to-indigo-500" },
  { initials: "JL", tone: "from-emerald-500 to-teal-500" },
  { initials: "DN", tone: "from-rose-500 to-orange-500" },
];

function HeroShowcase({ reduceMotion }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.95, ease: [0.16, 1, 0.3, 1], delay: reduceMotion ? 0 : 0.14 }}
      className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg xl:max-w-xl"
    >
      <div
        className={
          reduceMotion
            ? ""
            : "pointer-events-none absolute -inset-12 rounded-[2.75rem] bg-gradient-to-br from-aura-coral/25 via-transparent to-aura-violet/20 blur-3xl animate-hero-breathe"
        }
        aria-hidden
      />

      {/* Gradient frame — premium product shot */}
      <div className="relative rounded-[1.85rem] bg-gradient-to-br from-aura-coral/70 via-white/30 to-aura-violet/70 p-[1px] shadow-[0_32px_80px_-24px_rgba(15,23,42,0.2)] dark:from-aura-coral/40 dark:via-slate-700/30 dark:to-aura-violet/50 dark:shadow-[0_40px_100px_-28px_rgba(0,0,0,0.65)]">
        <div className="rounded-[1.8rem] bg-white/90 p-1 shadow-lux-lg backdrop-blur-xl dark:bg-slate-950/85">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50/95 to-white ring-1 ring-slate-900/[0.035] dark:from-slate-900/95 dark:to-slate-950 dark:ring-white/[0.06]">
            <div className="flex items-center gap-2 border-b border-slate-200/80 bg-gradient-to-r from-slate-50/95 via-white/80 to-slate-50/95 px-4 py-3 dark:border-slate-700/80 dark:from-slate-900/90 dark:via-slate-900/70 dark:to-slate-900/90">
              <div className="flex gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90 shadow-sm" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/85 shadow-sm" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90 shadow-sm" />
              </div>
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Live session · composite scoring
              </span>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Verdict layer</p>
                  <p className="mt-1 text-sm font-semibold tracking-tight text-aura-ink">Answer quality · pace · gaze</p>
                </div>
                <div className="relative rounded-full bg-gradient-to-br from-aura-coral via-aura-violet to-aura-coral p-[2.5px] shadow-lg shadow-aura-violet/20">
                  <div className="flex h-[4.75rem] w-[4.75rem] items-center justify-center rounded-full bg-white font-display text-[1.65rem] font-semibold tabular-nums tracking-tight text-aura-ink dark:bg-slate-950">
                    <motion.span
                      initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.35, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    >
                      8.6
                    </motion.span>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <span>Transcript energy</span>
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400/90">
                    <span className="relative flex h-1.5 w-1.5">
                      {!reduceMotion && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/50 opacity-75" />
                      )}
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Streaming
                  </span>
                </div>
                <div
                  className="flex h-[5.25rem] items-end justify-between gap-0.5 rounded-xl border border-slate-200/80 bg-slate-50/60 px-2 pb-2 pt-4 dark:border-slate-600/80 dark:bg-slate-800/50"
                  role="img"
                  aria-label="Abstract waveform visualization"
                >
                  {waveformHeights.map((pct, i) => (
                    <div
                      key={i}
                      className="min-w-[3px] flex-1 rounded-full bg-gradient-to-t from-aura-violet/20 via-aura-coral/55 to-aura-coral opacity-95"
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
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm dark:border-slate-600/80 dark:bg-slate-800/95 dark:text-slate-200"
                  >
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{chip.t}</span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-aura-ink dark:bg-slate-700 dark:text-slate-100">{chip.s}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-4 top-[18%] hidden h-28 w-20 rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white/80 to-white/30 shadow-lux backdrop-blur-md dark:border-slate-600/50 dark:from-slate-800/80 dark:to-slate-900/40 lg:block"
          animate={{ y: [0, -12, 0], rotate: [0, 1.5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-2 bottom-[12%] hidden h-16 w-28 rounded-2xl border border-slate-200/60 bg-white/50 shadow-md backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/50 lg:block"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
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
      transition: reduceMotion ? { duration: 0.01 } : { staggerChildren: 0.08, delayChildren: 0.04 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0.15 : 0.52, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-center overflow-hidden px-5 pb-24 pt-14 sm:px-6 sm:pb-32 sm:pt-20 lg:min-h-[calc(100vh-3rem)] lg:pb-36 lg:pt-20"
    >
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 980px 720px at var(--mx,50%) var(--my,38%), rgba(255,126,95,0.22), transparent 55%),
            radial-gradient(ellipse 560px 520px at 88% 12%, rgba(157,80,187,0.14), transparent 52%),
            radial-gradient(ellipse 520px 480px at 8% 92%, rgba(157,80,187,0.09), transparent 50%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.032) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_108%,rgba(255,255,255,0.97),transparent_58%)] dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_108%,rgba(10,11,16,0.55),transparent_58%)]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-aura-page via-aura-page/80 to-transparent dark:from-[#0a0b10] dark:via-[#0a0b10]/80" aria-hidden />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center lg:col-span-6 lg:items-start lg:pr-2 lg:text-left"
        >
          <motion.div variants={item} className="mb-7 inline-flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600 shadow-[0_1px_0_rgba(255,255,255,1)_inset,0_16px_40px_-18px_rgba(15,23,42,0.12)] backdrop-blur-md ring-1 ring-white/90 dark:border-slate-600/80 dark:bg-slate-900/85 dark:text-slate-300 dark:shadow-none dark:ring-slate-700/50"
              role="status"
            >
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/45 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.22)]" />
              </span>
              Gemini · MediaPipe · live coaching
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="max-w-[22ch] font-sans text-[2.75rem] font-semibold leading-[0.96] tracking-[-0.042em] text-aura-ink sm:max-w-none sm:text-[3.25rem] sm:tracking-[-0.038em] md:text-6xl md:leading-[0.95] lg:text-[3.5rem] xl:text-[4.25rem]"
          >
            Turn interview
            <br />
            <span className="font-display text-[1.02em] font-semibold italic tracking-[-0.02em] text-gradient drop-shadow-[0_2px_28px_rgba(157,80,187,0.14)]">
              pressure into signal
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-xl text-[15px] leading-[1.68] text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-[1.65] lg:mx-0"
          >
            A full-stack mock interview: questions grounded in your resume and JD, deterministic scoring, and{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">camera-aware presence coaching</span> so you walk into the real room already calibrated.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex w-full max-w-lg flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="w-full rounded-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/45 focus-visible:ring-offset-2 focus-visible:ring-offset-aura-page sm:w-auto"
            >
              <span className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-10 py-4 text-[15px] font-bold tracking-tight text-white shadow-[0_20px_50px_-12px_rgba(157,80,187,0.45),0_0_0_1px_rgba(255,255,255,0.12)_inset] transition-transform duration-250 ease-out-expo active:scale-[0.98] sm:w-auto sm:px-11">
                <span className="absolute inset-0 bg-gradient-to-br from-aura-coral via-fuchsia-500/90 to-aura-violet opacity-100 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-40" />
                <span className="relative">{user ? "Open dashboard" : "Start free — no card"}</span>
                <span className="relative transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
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

          <motion.div variants={item} className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:gap-6 lg:items-start">
            <a
              href="#how-it-works"
              className="group inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 no-underline transition-colors hover:text-aura-ink dark:text-slate-400 dark:hover:text-white"
            >
              See the full loop
              <span className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1" aria-hidden>
                ↓
              </span>
            </a>
            <span className="hidden h-4 w-px bg-slate-200 dark:bg-slate-700 sm:block" aria-hidden />
            <p className="text-center text-[13px] text-slate-500 dark:text-slate-500 sm:text-left">
              <span className="text-amber-500/90" aria-hidden>
                ★★★★★
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">Built for depth, not generic banks</span>
            </p>
          </motion.div>

          <motion.div variants={item} className="mt-12 flex flex-col items-center gap-6 sm:mt-14 lg:items-start">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5" aria-hidden>
                {proofAvatars.map((a) => (
                  <div
                    key={a.initials}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${a.tone} text-[10px] font-bold text-white shadow-md dark:border-slate-900`}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold tracking-tight text-aura-ink">Practiced by serious candidates</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">Campus hires · returning offers · role switches</p>
              </div>
            </div>

            <div className="w-full max-w-xl sm:max-w-none lg:max-w-none">
              <div className="grid grid-cols-3 divide-x divide-slate-200/90 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white/90 to-white/70 py-5 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_24px_48px_-28px_rgba(15,23,42,0.08)] backdrop-blur-md ring-1 ring-white/70 dark:divide-slate-700 dark:border-slate-700/90 dark:from-slate-900/70 dark:to-slate-950/80 dark:shadow-none dark:ring-slate-800/60 sm:py-6">
                {statRows.map((row) => (
                  <div key={row.l} className="flex flex-col items-center px-1 sm:px-2">
                    <div className="font-display text-2xl font-semibold tabular-nums text-aura-ink sm:text-3xl">{row.v}</div>
                    <div className="mt-2 max-w-[6.5rem] text-[9px] font-semibold uppercase leading-snug tracking-[0.2em] text-slate-500 dark:text-slate-400 sm:max-w-[10rem] sm:text-[10px] sm:tracking-[0.22em]">
                      {row.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="lg:col-span-6 lg:pl-2">
          <HeroShowcase reduceMotion={reduceMotion} />
        </div>
      </div>
    </section>
  );
}
