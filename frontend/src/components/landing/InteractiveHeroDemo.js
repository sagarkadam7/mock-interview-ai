import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const FILLER_WORDS = new Set(["well", "um", "uh", "like", "basically", "actually", "kinda", "sorta"]);

const SAMPLE_TRANSCRIPT = "Well, um, I think my biggest weakness is, like, I sometimes take on too much work.";

// Tokenize transcript preserving punctuation so we can typewrite + highlight fillers.
function tokenize(text) {
  return text.split(/(\s+)/).map((chunk) => {
    const isSpace = /^\s+$/.test(chunk);
    if (isSpace) return { kind: "space", text: chunk };
    const bare = chunk.replace(/[^a-zA-Z]/g, "").toLowerCase();
    return { kind: "word", text: chunk, isFiller: FILLER_WORDS.has(bare) };
  });
}

const RECORDING_MS = 3000;

export default function InteractiveHeroDemo() {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState("idle"); // idle | recording | transcribing | insights
  const [typedChars, setTypedChars] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const rafRef = useRef(0);
  const timerRef = useRef(0);

  const tokens = tokenize(SAMPLE_TRANSCRIPT);
  const fullLen = SAMPLE_TRANSCRIPT.length;

  const startDemo = useCallback(() => {
    if (phase !== "idle" && phase !== "insights") return;
    setPhase("recording");
    setTypedChars(0);
    setElapsedSec(0);

    // Recording countdown UI
    const recStart = performance.now();
    const tickRecord = (now) => {
      const t = Math.min((now - recStart) / RECORDING_MS, 1);
      setElapsedSec(Number((t * 3).toFixed(1)));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tickRecord);
      } else {
        setPhase("transcribing");
      }
    };
    rafRef.current = requestAnimationFrame(tickRecord);
  }, [phase]);

  const resetDemo = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);
    setPhase("idle");
    setTypedChars(0);
    setElapsedSec(0);
  }, []);

  // Typewriter effect when transcribing
  useEffect(() => {
    if (phase !== "transcribing") return;
    if (reduceMotion) {
      setTypedChars(fullLen);
      setPhase("insights");
      return;
    }
    const start = performance.now();
    const typeDuration = 1800;
    const tick = (now) => {
      const t = Math.min((now - start) / typeDuration, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      setTypedChars(Math.round(eased * fullLen));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase("insights");
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, fullLen, reduceMotion]);

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    clearInterval(timerRef.current);
  }, []);

  // Build visible tokens based on typedChars budget so filler words only appear once fully typed.
  let budget = typedChars;
  const renderedTokens = tokens.map((tok, i) => {
    if (budget <= 0) return { ...tok, visible: "", fullyTyped: false };
    if (tok.text.length <= budget) {
      budget -= tok.text.length;
      return { ...tok, visible: tok.text, fullyTyped: true };
    }
    const slice = tok.text.slice(0, budget);
    budget = 0;
    return { ...tok, visible: slice, fullyTyped: false };
  });

  const insightsReady = phase === "insights";
  const showTranscript = phase === "transcribing" || phase === "insights";

  return (
    <div className="relative mx-auto w-full max-w-none lg:mx-0" aria-label="InterviewAI live coaching demo" role="region">
      {/* Outer rim — reads as a deliberate “device” frame */}
      <div
        className="relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-white via-white to-slate-50/95 p-[1px] shadow-lux-lg dark:from-slate-800 dark:via-slate-900 dark:to-slate-950"
        style={{
          boxShadow:
            "0 1px 0 0 rgba(255,255,255,0.95) inset, 0 40px 90px -40px rgba(79,70,229,0.18), 0 28px 70px -48px rgba(244,63,94,0.12), 0 0 0 1px rgba(15,23,42,0.04)",
        }}
      >
        <div className="relative overflow-hidden rounded-[1.3rem] border border-slate-200/75 bg-gradient-to-br from-white/98 to-slate-50/92 p-6 backdrop-blur-xl dark:border-slate-700/65 dark:from-slate-900/95 dark:to-slate-950/92 sm:p-8">
          {/* Ambient glow + top sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-aura-coral/30 to-aura-violet/25 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-white/10"
          />

          {/* Header */}
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" aria-hidden />
                <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  Live coaching demo
                </span>
              </div>
              <span className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
                Try it →
              </span>
            </div>
            <div
              className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/90"
              aria-hidden
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-aura-coral via-fuchsia-500 to-aura-violet"
                initial={false}
                animate={{
                  width:
                    phase === "idle"
                      ? "18%"
                      : phase === "recording"
                        ? `${28 + (elapsedSec / 3) * 52}%`
                        : phase === "transcribing"
                          ? "88%"
                          : "100%",
                }}
                transition={{ duration: phase === "recording" ? 0.15 : 0.45, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>

          {/* Mic button area */}
          <div className="relative mt-8 flex flex-col items-center">
            <div className="relative grid place-items-center">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-[-14px] rounded-full border border-slate-200/60 dark:border-slate-600/50"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-[-28px] rounded-full border border-slate-200/35 opacity-70 dark:border-slate-600/30"
              />
              <button
                type="button"
                onClick={phase === "idle" || phase === "insights" ? startDemo : resetDemo}
                disabled={phase === "recording" || phase === "transcribing"}
                aria-pressed={phase === "recording"}
                aria-label={phase === "idle" || phase === "insights" ? "Start microphone demo" : "Reset demo"}
                className={`group relative inline-flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full transition-transform duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aura-violet/40 ${
                  phase === "idle" || phase === "insights" ? "hover:scale-[1.04] active:scale-[0.97]" : ""
                }`}
              >
                {phase === "recording" && (
                  <span aria-hidden className="absolute inset-[-6px] animate-ping rounded-full bg-rose-500/20" />
                )}
                <span
                  aria-hidden
                  className={`absolute inset-0 rounded-full bg-gradient-to-br transition-all duration-500 ${
                    phase === "recording"
                      ? "from-rose-500 to-red-600 shadow-[0_20px_56px_-10px_rgba(244,63,94,0.55)]"
                      : "from-aura-coral to-aura-violet shadow-[0_20px_56px_-10px_rgba(79,70,229,0.42)]"
                  }`}
                />
                <span
                  aria-hidden
                  className="absolute inset-[3px] rounded-full bg-gradient-to-br from-white/35 via-transparent to-transparent opacity-50"
                />
                <svg viewBox="0 0 24 24" fill="none" className="relative h-10 w-10 text-white" aria-hidden>
              <path
                d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z"
                fill="currentColor"
              />
              <path
                d="M5 11a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V21a1 1 0 1 1-2 0v-3.07A7 7 0 0 1 5 11z"
                fill="currentColor"
                opacity="0.85"
              />
                </svg>
              </button>
            </div>
          <p className="mt-5 max-w-[260px] text-center text-[13px] font-medium leading-snug text-slate-600 dark:text-slate-400 sm:max-w-[320px]" aria-live="polite">
            {phase === "idle" && "Tap the mic to hear a sample answer coached in real time."}
            {phase === "recording" && `Listening · ${elapsedSec.toFixed(1)}s / 3.0s`}
            {phase === "transcribing" && "Transcribing with real-time speech analytics…"}
            {phase === "insights" && "Replay or read the insights InterviewAI surfaced →"}
          </p>
        </div>

        {/* Transcript panel */}
        <div className="relative mt-7 rounded-2xl border border-slate-200/85 bg-white/85 p-4 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.2)] dark:border-slate-700/80 dark:bg-slate-900/75 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Real-time transcript
            </span>
            {phase === "insights" && (
              <button
                type="button"
                onClick={resetDemo}
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700 transition-colors hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-200"
              >
                Replay
              </button>
            )}
          </div>

          <p className="mt-3 min-h-[5.25rem] text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 sm:min-h-[5.5rem]">
            {!showTranscript && (
              <span className="text-slate-400 dark:text-slate-500">Your transcript will appear here…</span>
            )}
            {showTranscript &&
              renderedTokens.map((tok, idx) => {
                if (tok.kind === "space") return <span key={idx}>{tok.visible}</span>;
                // Highlight filler words in red once fully typed.
                const highlight = tok.isFiller && tok.fullyTyped;
                return (
                  <span
                    key={idx}
                    className={
                      highlight
                        ? "relative inline-block font-semibold text-rose-600 underline decoration-rose-500/70 decoration-wavy underline-offset-[5px] dark:text-rose-400"
                        : undefined
                    }
                  >
                    {tok.visible}
                    {highlight && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded-md bg-rose-600 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white shadow-md sm:inline-block"
                      >
                        filler
                      </span>
                    )}
                  </span>
                );
              })}
            {phase === "transcribing" && (
              <span aria-hidden className="ml-0.5 inline-block h-[1.1em] w-[2px] -translate-y-[2px] animate-pulse bg-aura-violet align-middle" />
            )}
          </p>
        </div>

        {/* Insights */}
        <AnimatePresence>
          {insightsReady && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="mt-6 grid grid-cols-3 gap-2 sm:gap-3"
              role="status"
              aria-label="Live coaching insights"
            >
              {[
                { k: "Fillers", v: "2", tone: "text-rose-600 dark:text-rose-400" },
                { k: "WPM", v: "128", tone: "text-amber-600 dark:text-amber-400" },
                { k: "Clarity", v: "7.4", tone: "text-emerald-600 dark:text-emerald-400" },
              ].map((m) => (
                <div
                  key={m.k}
                  className="rounded-xl border border-slate-200/85 bg-white/90 px-3 py-2.5 text-center shadow-sm dark:border-slate-700/80 dark:bg-slate-900/65"
                >
                  <div className={`font-display text-lg font-bold tabular-nums ${m.tone}`}>{m.v}</div>
                  <div className="mt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    {m.k}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
