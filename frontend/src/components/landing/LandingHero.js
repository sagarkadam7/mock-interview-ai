import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import InteractiveHeroDemo from "./InteractiveHeroDemo";
import VideoModal from "../VideoModal";

const statRows = [
  { v: "7", l: "Tailored Qs" },
  { v: "Live", l: "Speech + gaze" },
  { v: "PDF", l: "Export reports" },
];

const energyBars = [
  18, 24, 22, 28, 26, 34, 30, 38, 34, 44, 40, 52, 48, 58, 54, 66, 62, 70, 64, 74, 68, 78, 70, 82, 74, 80, 72, 76,
];

const proofAvatars = [
  { initials: "AR", tone: "from-violet-500 to-fuchsia-500" },
  { initials: "SK", tone: "from-aura-coral to-amber-500" },
  { initials: "MP", tone: "from-sky-500 to-indigo-500" },
  { initials: "JL", tone: "from-emerald-500 to-teal-500" },
  { initials: "DN", tone: "from-rose-500 to-orange-500" },
];

function HeroShowcase({ reduceMotion }) {
  const [score, setScore] = useState(reduceMotion ? 8.6 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    const start = performance.now();
    const duration = 1200;
    const from = 0;
    const to = 8.6;

    let raf = 0;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + (to - from) * eased;
      setScore(Math.round(v * 10) / 10);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion]);

  const followUpText = "What tradeoff did you reject — and why?";
  const followUpCharCount = followUpText.length;

  const cardStyle = useMemo(
    () => ({
      ["--cardBg"]: "#161012",
      ["--cardBg2"]: "#1a1314",
      ["--borderGlow"]: "rgba(255,80,80,0.25)",
      ["--muted"]: "#6b6460",
      ["--pink"]: "#e8609a",
      ["--barBottom"]: "#c0456a",
      ["--barMid"]: "#e8609a",
      ["--barTop"]: "#9b6fdc",
      ["--track"]: "#2a2228",
      ["--pillBg"]: "#1e1820",
      ["--pillBorder"]: "#2e2a30",
    }),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.95, ease: [0.16, 1, 0.3, 1], delay: reduceMotion ? 0 : 0.14 }}
      className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-lg xl:max-w-xl"
    >
      <style>{`
        .lux-scorecard {
          width: 100%;
          max-width: 540px;
          padding: 24px;
          box-sizing: border-box;
          border-radius: 16px;
          background: radial-gradient(120% 120% at 20% 0%, rgba(232,96,154,0.14) 0%, transparent 55%),
            radial-gradient(120% 120% at 90% 12%, rgba(155,111,220,0.12) 0%, transparent 55%),
            linear-gradient(180deg, var(--cardBg) 0%, var(--cardBg2) 100%);
          border: 1px solid var(--borderGlow);
          box-shadow: 0 0 60px rgba(220, 60, 80, 0.12), 0 0 120px rgba(180, 50, 200, 0.08);
          transform: perspective(1100px) rotateX(7deg) rotateY(-10deg);
          transform-origin: center;
        }
        @media (max-width: 640px) {
          .lux-scorecard {
            transform: none;
            padding: 18px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lux-scorecard { transform: none; }
        }
        .lux-pulse-dot {
          animation: luxPulse 1.5s ease-in-out infinite;
          box-shadow: 0 0 12px rgba(40,200,100,0.45);
        }
        @media (prefers-reduced-motion: reduce) {
          .lux-pulse-dot { animation: none; opacity: 1; }
        }
        @keyframes luxPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .lux-energy-bar { transform-origin: bottom; }
        .lux-typewriter {
          width: calc(var(--chars) * 1ch);
          max-width: 100%;
          overflow: hidden;
          white-space: nowrap;
          border-right: 2px solid rgba(232,96,154,0.7);
          animation: luxType 1.25s steps(var(--chars)) both;
          animation-delay: 1s;
        }
        .lux-typewriter--static {
          animation: none;
          width: auto;
          max-width: 100%;
          white-space: normal;
          border-right: none;
        }
        @keyframes luxType { from { width: 0ch; } to { width: calc(var(--chars) * 1ch); } }
        @media (prefers-reduced-motion: reduce) {
          .lux-typewriter:not(.lux-typewriter--static) { animation: none; }
        }
        .lux-metric-pill {
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .lux-metric-pill:hover {
          border-color: #555555;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04);
        }
      `}</style>

      <motion.div
        style={cardStyle}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.15 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="lux-scorecard relative mx-auto select-none"
        aria-label="Live interview scorecard mock"
      >
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3">
          <div className="flex shrink-0 items-center gap-2">
            <span className="h-[10px] w-[10px] rounded-full" style={{ background: "#ff5f57" }} aria-hidden />
            <span className="h-[10px] w-[10px] rounded-full" style={{ background: "#febc2e" }} aria-hidden />
            <span className="h-[10px] w-[10px] rounded-full" style={{ background: "#28c840" }} aria-hidden />
          </div>
          <div
            className="min-w-0 flex-1 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] sm:text-[11px] sm:tracking-[0.32em]"
            style={{ color: "var(--muted)" }}
          >
            LIVE SESSION · SCORECARD
          </div>
          <div
            className="inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] sm:text-[11px] sm:tracking-[0.14em]"
            style={{ background: "rgba(40,200,100,0.12)", borderColor: "#28c840", color: "#28c840" }}
          >
            <span className="lux-pulse-dot h-2 w-2 rounded-full" style={{ background: "#28c840" }} aria-hidden />
            STREAMING
          </div>
        </div>

        <div className="mt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

        {/* Section 1 */}
        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: "var(--muted)" }}>
              LIVE MOCK INTERVIEW
            </div>
            <div className="mt-2 text-[15px] font-semibold text-white">Score + presence + adaptive follow-ups</div>
          </div>

          <div className="relative grid h-16 w-16 place-items-center rounded-full" aria-label="Composite score">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 210deg, rgba(232,96,154,0.0) 0%, rgba(232,96,154,0.9) 35%, rgba(155,111,220,0.9) 70%, rgba(232,96,154,0.0) 100%)",
                filter: "blur(0px)",
                opacity: 0.55,
              }}
              aria-hidden
            />
            <div
              className="absolute inset-[2px] rounded-full"
              style={{
                border: "2px solid #e8609a",
                boxShadow: "0 0 16px rgba(232,96,154,0.5)",
                background: "rgba(0,0,0,0.25)",
              }}
              aria-hidden
            />
            <div className="relative font-display text-[22px] font-semibold text-white tabular-nums">
              {score.toFixed(1)}
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mt-6">
          <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: "var(--muted)" }}>
            <span>ENERGY</span>
            <span>LAST 30S</span>
          </div>

          <div className="mt-3 flex h-20 min-w-0 items-end justify-between gap-0.5 sm:gap-1">
            {energyBars.map((h, i) => (
              <motion.div
                key={i}
                className="lux-energy-bar min-w-[2px] max-w-[10px] flex-1"
                initial={reduceMotion ? false : { scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  height: `${h}px`,
                  borderRadius: "3px 3px 0 0",
                  background: `linear-gradient(180deg, var(--barTop) 0%, var(--barMid) 45%, var(--barBottom) 100%)`,
                  opacity: 0.95,
                }}
                aria-hidden
              />
            ))}
          </div>
        </div>

        {/* Section 3 */}
        <div className="mt-6 flex flex-wrap gap-3">
          {[
            ["GAZE", "78%"],
            ["PACE", "142 wpm"],
            ["FILLERS", "Low"],
          ].map(([k, v]) => (
            <div
              key={k}
              className="lux-metric-pill group inline-flex cursor-default items-center gap-3 rounded-full border px-4 py-2"
              style={{ background: "var(--pillBg)", borderColor: "var(--pillBorder)" }}
            >
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--muted)" }}>
                {k}
              </span>
              <span className="font-mono text-[11px] font-bold text-white">{v}</span>
            </div>
          ))}
        </div>

        {/* Section 4 */}
        <div
          className="mt-6 grid gap-4 rounded-2xl border p-4"
          style={{ background: "#1c1618", borderColor: "#2a2228" }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Rubric */}
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: "var(--muted)" }}>
                RUBRIC
              </div>
              <div className="mt-3 space-y-3">
                {[
                  ["Structure", 80, "#4ade80"],
                  ["Clarity", 60, "#a855f7"],
                  ["Depth", 45, "#f59e0b"],
                ].map(([label, pct, color], idx) => (
                  <div key={label}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-white">{label}</span>
                      <span className="font-mono text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {pct}%
                      </span>
                    </div>
                    <div className="h-[5px] w-full overflow-hidden rounded-full" style={{ background: "var(--track)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={reduceMotion ? false : { width: "0%" }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.35 + idx * 0.08 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follow-up */}
            <div className="relative">
              <div className="font-mono text-[9px] font-bold uppercase tracking-[0.32em]" style={{ color: "var(--muted)" }}>
                ADAPTIVE FOLLOW-UP
              </div>
              <div className="mt-3 flex gap-3">
                <div className="mt-1 h-10 w-[2px] rounded-full" style={{ background: "var(--pink)" }} aria-hidden />
                <div className="min-w-0">
                  <div
                    className={`lux-typewriter italic ${reduceMotion ? "lux-typewriter--static" : ""}`}
                    style={{ ["--chars"]: followUpCharCount, color: "#e8e0ec", fontSize: 13, lineHeight: 1.4 }}
                    aria-label="Follow-up question"
                  >
                    {followUpText}
                  </div>
                  <div className="mt-2 text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                    Explain the constraint, alternatives, and measurable impact.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Removed floating placeholders (looked like glitches). */}
    </motion.div>
  );
}

export default function LandingHero({ user }) {
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const [videoOpen, setVideoOpen] = useState(false);

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
      id="top"
      ref={heroRef}
      className="relative flex min-h-[calc(100vh-3.5rem)] scroll-mt-20 flex-col justify-center overflow-hidden px-5 pb-24 pt-14 sm:px-6 sm:pb-32 sm:pt-20 lg:min-h-[calc(100vh-3rem)] lg:pb-36 lg:pt-20"
    >
      {/* Atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 980px 720px at var(--mx,50%) var(--my,38%), rgba(232,85,71,0.22), transparent 55%),
            radial-gradient(ellipse 560px 520px at 88% 12%, rgba(91,33,182,0.14), transparent 52%),
            radial-gradient(ellipse 520px 480px at 8% 92%, rgba(91,33,182,0.09), transparent 50%)`,
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
            className="max-w-[22ch] text-balance font-sans text-[2.75rem] font-semibold leading-[0.98] tracking-[-0.042em] text-aura-ink sm:max-w-none sm:text-[3.25rem] sm:tracking-[-0.038em] md:text-6xl md:leading-[0.96] lg:text-[3.5rem] xl:text-[4.25rem]"
          >
            Turn interview
            <br />
            <span className="font-display text-[1.02em] font-semibold italic tracking-[-0.02em] text-gradient drop-shadow-[0_2px_28px_rgba(91,33,182,0.14)]">
              pressure into signal
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mx-auto mt-7 max-w-xl text-pretty text-[15px] leading-[1.68] text-slate-600 dark:text-slate-400 sm:text-lg sm:leading-[1.65] lg:mx-0"
          >
            A full-stack mock interview: questions grounded in your resume and JD, deterministic scoring, and{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">camera-aware presence coaching</span> so you walk into the real room already calibrated.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex w-full max-w-lg flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-4 lg:justify-start">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="w-full rounded-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/45 focus-visible:ring-offset-2 focus-visible:ring-offset-aura-page sm:w-auto"
            >
              <span className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-10 py-4 text-[15px] font-bold tracking-tight text-white shadow-[0_20px_50px_-12px_rgba(91,33,182,0.45),0_0_0_1px_rgba(255,255,255,0.12)_inset] transition-transform duration-250 ease-out-expo active:scale-[0.98] sm:w-auto sm:px-11">
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
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              className="btn-outline w-full justify-center py-4 font-semibold sm:inline-flex sm:w-auto sm:px-8"
            >
              Watch demo
            </button>
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
          {/* Interactive demo lets visitors experience the core value (filler detection) in the hero */}
          <InteractiveHeroDemo />
        </div>
      </div>

      <VideoModal open={videoOpen} onClose={() => setVideoOpen(false)} />
    </section>
  );
}
