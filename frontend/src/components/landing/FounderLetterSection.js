import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FOUNDER_LETTER } from "../../data/marketing";

export default function FounderLetterSection() {
  const reduceMotion = useReducedMotion();

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  const accent = "signal";
  const headline = FOUNDER_LETTER.headline;
  const accentIdx = headline.indexOf(accent);
  const headlineBefore = accentIdx >= 0 ? headline.slice(0, accentIdx) : headline;
  const headlineAfter = accentIdx >= 0 ? headline.slice(accentIdx + accent.length) : "";

  return (
    <section
      id="founder-letter"
      aria-labelledby="founder-heading"
      className="relative z-10 scroll-mt-24 overflow-hidden border-y border-slate-200/70 bg-gradient-to-b from-[#fdfcfa] via-white to-[#f8f7fc] py-24 dark:border-slate-800/70 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)`,
          backgroundSize: "80px 100%",
          backgroundPosition: "center top",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 18% 40%, rgba(255, 200, 185, 0.22) 0%, transparent 55%),
            radial-gradient(ellipse 55% 50% at 88% 60%, rgba(91,33,182, 0.08) 0%, transparent 50%)`,
        }}
        aria-hidden
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent dark:via-slate-700/80" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
              <div className="section-eyebrow mb-6">{FOUNDER_LETTER.eyebrow}</div>
              <h2
                id="founder-heading"
                className="font-display text-3xl font-semibold leading-[1.15] tracking-tight text-aura-ink md:text-4xl lg:text-[2.65rem]"
              >
                {headlineBefore}
                {accentIdx >= 0 && <span className="text-gradient italic">{accent}</span>}
                {headlineAfter}
              </h2>
            </motion.div>

            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUp}
              transition={{ delay: reduceMotion ? 0 : 0.06 }}
              className="mt-8 text-lg font-medium leading-loose text-slate-700 dark:text-slate-300 md:text-xl md:leading-loose"
            >
              {FOUNDER_LETTER.lead}
            </motion.p>

            <div className="mt-10 space-y-6 text-[15px] leading-loose text-slate-600 dark:text-slate-400 md:text-base md:leading-loose">
              {FOUNDER_LETTER.paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-30px" }}
                  variants={fadeUp}
                  transition={{ delay: reduceMotion ? 0 : 0.08 + i * 0.05 }}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </div>

          <motion.aside
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUp}
            transition={{ delay: reduceMotion ? 0 : 0.12 }}
            className="lg:col-span-5 lg:sticky lg:top-28"
          >
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white/90 p-8 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/70 dark:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)] md:p-10">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-aura-coral/20 to-aura-violet/15 blur-3xl"
                aria-hidden
              />
              <div className="relative flex flex-col items-center text-center">
                <div
                  className="mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-slate-200/95 bg-gradient-to-br from-white to-slate-50 text-xl font-semibold tracking-tight text-gradient shadow-inner dark:border-slate-600 dark:from-slate-800 dark:to-slate-900"
                  aria-hidden
                >
                  SK
                </div>
                <blockquote className="text-lg font-medium leading-loose text-slate-700 dark:text-slate-300 md:text-xl">
                  &ldquo;{FOUNDER_LETTER.asideQuote}&rdquo;
                </blockquote>
                <div className="mt-10 h-px w-12 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600" aria-hidden />
                <p className="mt-8 font-semibold tracking-tight text-aura-ink">{FOUNDER_LETTER.name}</p>
                <p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{FOUNDER_LETTER.role}</p>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
