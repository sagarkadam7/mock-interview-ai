import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import InteractiveHeroDemo from "./InteractiveHeroDemo";

const DEMO_VIDEO_URL = String(process.env.REACT_APP_DEMO_VIDEO_URL || "").trim();

const statRows = [
  { v: "7", l: "Questions tailored to your résumé" },
  { v: "Live", l: "Speech + gaze, every answer" },
];

const proofAvatars = [
  { initials: "AR", tone: "from-violet-500 to-fuchsia-500" },
  { initials: "SK", tone: "from-aura-coral to-amber-500" },
  { initials: "MP", tone: "from-sky-500 to-indigo-500" },
  { initials: "JL", tone: "from-emerald-500 to-teal-500" },
  { initials: "DN", tone: "from-rose-500 to-orange-500" },
];

const capabilityChips = [
  { label: "Résumé + JD grounded", icon: "◆" },
  { label: "Deterministic scoring", icon: "◇" },
  { label: "Presence-aware coaching", icon: "○" },
];

export default function LandingHero({ user }) {
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || reduceMotion) return;
    const onMove = (e) => {
      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      hero.style.setProperty("--mx", `${x * 100}%`);
      hero.style.setProperty("--my", `${y * 100}%`);
    };
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  }, [reduceMotion]);

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
      id="top"
      ref={heroRef}
      className="relative flex min-h-[calc(100vh-3.5rem)] scroll-mt-20 flex-col justify-center overflow-hidden px-4 pb-24 pt-14 sm:px-6 sm:pb-32 sm:pt-16 md:px-8 lg:min-h-[calc(100vh-3rem)] lg:px-10 lg:pb-28 lg:pt-16 xl:px-14 2xl:px-20"
    >
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 0% 45%, rgba(91,33,182,0.09), transparent 50%),
            radial-gradient(ellipse 65% 50% at 100% 35%, rgba(232,85,71,0.1), transparent 52%),
            radial-gradient(ellipse 980px 720px at var(--mx,50%) var(--my,38%), rgba(232,85,71,0.22), transparent 55%),
            radial-gradient(ellipse 560px 520px at 88% 12%, rgba(91,33,182,0.14), transparent 52%),
            radial-gradient(ellipse 520px 480px at 8% 92%, rgba(91,33,182,0.09), transparent 50%)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55] dark:opacity-[0.4]"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.038) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.038) 1px, transparent 1px)`,
          backgroundSize: "52px 52px",
        }}
        aria-hidden
      />
      {/* Soft structural arcs — reads as “product UI” depth, not empty whitespace */}
      <div
        className="pointer-events-none absolute -left-[min(28%,420px)] top-1/2 hidden h-[min(88vh,820px)] w-[min(88vh,820px)] -translate-y-1/2 rounded-[50%] border border-slate-200/60 dark:border-slate-700/40 lg:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-[min(22%,320px)] top-[18%] hidden h-[520px] w-[520px] rounded-[50%] border border-slate-200/45 dark:border-slate-700/35 xl:block"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_108%,rgba(255,255,255,0.97),transparent_58%)] dark:bg-[radial-gradient(ellipse_90%_55%_at_50%_108%,rgba(10,11,16,0.55),transparent_58%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-aura-page via-aura-page/80 to-transparent dark:from-[#0a0b10] dark:via-[#0a0b10]/80"
        aria-hidden
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 md:gap-x-8 md:gap-y-10 md:items-start lg:gap-x-10 xl:gap-x-14 2xl:gap-x-16">
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="flex min-w-0 flex-col items-center text-center lg:items-start lg:pr-2 lg:text-left xl:pr-4"
        >
          <motion.div
            variants={item}
            className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 lg:justify-start"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600 shadow-sm backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/55 dark:text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
              </span>
              Live rehearsal studio
            </span>
            <span className="hidden rounded-full border border-slate-200/80 bg-slate-50/90 px-3 py-1.5 text-[11px] font-medium text-slate-500 backdrop-blur-sm sm:inline-flex dark:border-slate-700/70 dark:bg-slate-900/40 dark:text-slate-400">
              Built for real hiring loops
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="w-full min-w-0 text-balance font-sans text-[2.85rem] font-semibold leading-[1.02] tracking-[-0.04em] text-aura-ink sm:text-[3.35rem] sm:tracking-[-0.038em] md:text-6xl md:leading-[0.98] lg:text-[3.45rem] lg:leading-[0.97] xl:text-[4.35rem] xl:tracking-[-0.042em]"
          >
            Turn interview
            <br />
            <span className="font-display text-[1.02em] font-semibold italic tracking-[-0.02em] text-gradient drop-shadow-[0_2px_28px_rgba(91,33,182,0.14)]">
              pressure into signal
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-6 w-full max-w-xl text-pretty text-[15px] leading-[1.72] text-slate-600 dark:text-slate-400 sm:mt-7 sm:max-w-2xl sm:text-[17px] sm:leading-[1.68] lg:mx-0 lg:max-w-none xl:max-w-2xl"
          >
            A complete mock loop — questions grounded in your résumé and JD, deterministic scoring, and{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              camera-aware presence coaching
            </span>{" "}
            — so you walk into the real room already calibrated.
          </motion.p>

          <motion.ul
            variants={item}
            className="mx-auto mt-6 flex w-full max-w-none flex-wrap justify-center gap-2 sm:gap-2.5 lg:mx-0 lg:justify-start"
            aria-label="Product capabilities"
          >
            {capabilityChips.map((c) => (
              <li
                key={c.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/85 bg-white/60 px-3 py-1.5 text-[12px] font-medium text-slate-700 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_24px_-16px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-slate-600/60 dark:bg-slate-900/45 dark:text-slate-200"
              >
                <span
                  className="select-none text-[10px] text-aura-violet/80 dark:text-violet-300/90"
                  aria-hidden
                >
                  {c.icon}
                </span>
                {c.label}
              </li>
            ))}
          </motion.ul>

          <motion.div variants={item} className="mt-9 flex w-full max-w-none flex-col gap-4">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-start">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="w-full rounded-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/45 focus-visible:ring-offset-2 focus-visible:ring-offset-aura-page sm:w-auto"
              >
                <span className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-10 py-4 text-[15px] font-bold tracking-tight text-white shadow-[0_20px_50px_-12px_rgba(91,33,182,0.45),0_0_0_1px_rgba(255,255,255,0.12)_inset] transition-[transform,box-shadow] duration-300 ease-out-expo group-hover:shadow-[0_28px_64px_-14px_rgba(91,33,182,0.5),0_0_0_1px_rgba(255,255,255,0.14)_inset] active:scale-[0.98] sm:w-auto sm:px-11">
                  <span className="absolute inset-0 bg-gradient-to-br from-aura-coral via-fuchsia-500/90 to-aura-violet opacity-100 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent opacity-40" />
                  <span className="relative">{user ? "Open dashboard" : "Start free — no card"}</span>
                  <span
                    className="relative transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    →
                  </span>
                </span>
              </Link>
              {!user && (
                <Link to="/login" className="w-full no-underline sm:w-auto">
                  <span className="btn-secondary inline-flex w-full justify-center py-3.5 sm:inline-flex sm:w-auto sm:px-8">
                    Sign in
                  </span>
                </Link>
              )}
              {user && (
                <Link to="/interview/new" className="w-full no-underline sm:w-auto">
                  <span className="btn-outline inline-flex w-full justify-center py-3.5 font-semibold sm:w-auto sm:px-8">
                    New interview
                  </span>
                </Link>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:gap-6">
              {DEMO_VIDEO_URL ? (
                <a
                  href={DEMO_VIDEO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-[color,box-shadow,border-color] hover:border-slate-300 hover:text-aura-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/45 focus-visible:ring-offset-2 focus-visible:ring-offset-aura-page dark:border-slate-600/70 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white sm:inline-flex sm:border-0 sm:bg-transparent sm:px-1 sm:py-1 sm:shadow-none sm:underline sm:decoration-slate-300 sm:decoration-2 sm:underline-offset-4 sm:backdrop-blur-none dark:sm:decoration-slate-600"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-aura-coral/15 to-aura-violet/15 text-aura-violet dark:from-aura-coral/25 dark:to-aura-violet/25 sm:h-auto sm:w-auto sm:rounded-none sm:bg-transparent"
                    aria-hidden
                  >
                    ▶
                  </span>
                  Watch demo
                </a>
              ) : (
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition-[color,box-shadow,border-color] hover:border-slate-300 hover:text-aura-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/45 focus-visible:ring-offset-2 focus-visible:ring-offset-aura-page dark:border-slate-600/70 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white sm:inline-flex sm:border-0 sm:bg-transparent sm:px-1 sm:py-1 sm:shadow-none sm:underline sm:decoration-slate-300 sm:decoration-2 sm:underline-offset-4 sm:backdrop-blur-none dark:sm:decoration-slate-600"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-aura-coral/15 to-aura-violet/15 text-aura-violet dark:from-aura-coral/25 dark:to-aura-violet/25 sm:h-auto sm:w-auto sm:rounded-none sm:bg-transparent"
                    aria-hidden
                  >
                    ▶
                  </span>
                  See how it works
                </a>
              )}
              <a
                href="#how-it-works"
                className="group inline-flex items-center justify-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 no-underline transition-colors hover:text-aura-ink dark:text-slate-400 dark:hover:text-white sm:justify-start"
              >
                See the full loop
                <span
                  className="transition-transform duration-300 ease-out-expo group-hover:translate-x-1"
                  aria-hidden
                >
                  →
                </span>
              </a>
            </div>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-12 flex flex-col items-center gap-6 border-t border-slate-200/80 pt-10 dark:border-slate-700/60 lg:items-start"
          >
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex -space-x-2" aria-hidden>
                {proofAvatars.slice(0, 4).map((a) => (
                  <div
                    key={a.initials}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${a.tone} text-[9px] font-semibold text-white shadow-md dark:border-slate-900`}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Used by candidates rehearsing real loops
                </p>
                <p className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-500">
                  Not generic question banks — calibrated to your story.
                </p>
              </div>
            </div>

            <ul
              className="mx-auto grid w-full max-w-none grid-cols-2 gap-x-6 gap-y-2 text-left sm:mx-0 sm:max-w-md lg:max-w-none"
              aria-label="Session highlights"
            >
              {statRows.map((row) => (
                <li
                  key={row.l}
                  className="relative flex min-w-0 flex-col items-start gap-1.5 rounded-r-xl bg-gradient-to-r from-slate-50/90 to-transparent py-1.5 pl-5 dark:from-slate-900/50 dark:to-transparent"
                >
                  <span
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-gradient-to-b from-aura-coral to-aura-violet"
                    aria-hidden
                  />
                  <span className="font-display text-[1.85rem] font-medium italic tabular-nums tracking-tight text-aura-ink md:text-[2rem]">
                    {row.v}
                  </span>
                  <span className="text-[12px] leading-snug text-slate-500 dark:text-slate-400">{row.l}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <div className="relative z-[2] min-w-0 w-full md:sticky md:top-24 md:self-start lg:top-28 lg:pl-2 xl:pl-4">
          <motion.div
            className="w-full"
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0.15 : 0.55,
              ease: [0.16, 1, 0.3, 1],
              delay: reduceMotion ? 0 : 0.08,
            }}
          >
            <InteractiveHeroDemo />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
