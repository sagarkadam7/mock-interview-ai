import React, { useCallback, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FOUNDERS_NOTE } from "../../data/marketing";

export default function FounderLetterSection() {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const founders = FOUNDERS_NOTE.founders;
  const [activeId, setActiveId] = useState(founders[0]?.id ?? "sagar");
  const active = founders.find((f) => f.id === activeId) ?? founders[0];
  const activeIndex = founders.findIndex((f) => f.id === activeId);

  const fadeUp = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: reduceMotion ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] } },
  };

  const accent = "signal";
  const headline = FOUNDERS_NOTE.headline;
  const accentIdx = headline.toLowerCase().indexOf(accent);
  const headlineBefore = accentIdx >= 0 ? headline.slice(0, accentIdx) : headline;
  const headlineAfter = accentIdx >= 0 ? headline.slice(accentIdx + accent.length) : "";

  const tabIds = founders.map((f) => `${baseId}-tab-${f.id}`);
  const panelId = `${baseId}-panel`;

  const focusTab = useCallback(
    (index) => {
      const i = Math.max(0, Math.min(index, founders.length - 1));
      setActiveId(founders[i].id);
      const el = document.getElementById(tabIds[i]);
      el?.focus();
    },
    [founders, tabIds]
  );

  const onTabKeyDown = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusTab(activeIndex + 1 >= founders.length ? 0 : activeIndex + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusTab(activeIndex - 1 < 0 ? founders.length - 1 : activeIndex - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusTab(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusTab(founders.length - 1);
    }
  };

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
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeUp}>
          <div className="section-eyebrow mb-6">{FOUNDERS_NOTE.eyebrow}</div>
          <h2
            id="founder-heading"
            className="max-w-4xl font-display text-3xl font-semibold leading-[1.15] tracking-tight text-aura-ink md:text-4xl lg:text-[2.65rem]"
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
          className="mt-8 max-w-3xl text-lg font-medium leading-loose text-slate-700 dark:text-slate-300 md:text-xl md:leading-loose"
        >
          {FOUNDERS_NOTE.opening}
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUp}
          transition={{ delay: reduceMotion ? 0 : 0.1 }}
          className="mt-14"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200/90 bg-white/80 p-6 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.14)] backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/60 dark:shadow-[0_20px_50px_-28px_rgba(0,0,0,0.5)] md:p-8">
            <p id={`${baseId}-tabs-hint`} className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              A note from each of us
            </p>
            <div
              role="tablist"
              aria-labelledby={`${baseId}-tabs-hint`}
              onKeyDown={onTabKeyDown}
              className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3"
            >
              {founders.map((f, i) => {
                const selected = f.id === activeId;
                return (
                  <button
                    key={f.id}
                    id={tabIds[i]}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={panelId}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveId(f.id)}
                    className={[
                      "rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aura-violet/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900",
                      selected
                        ? "border-aura-violet/35 bg-gradient-to-br from-aura-coral/[0.08] via-white to-aura-violet/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] dark:from-aura-coral/[0.12] dark:via-slate-900 dark:to-aura-violet/[0.12] dark:shadow-none"
                        : "border-slate-200/90 bg-white/60 hover:border-slate-300 hover:bg-white dark:border-slate-600/60 dark:bg-slate-800/40 dark:hover:border-slate-500",
                    ].join(" ")}
                  >
                    <span className="block font-semibold tracking-tight text-aura-ink dark:text-slate-100">{f.firstName}</span>
                    <span className="mt-1 block font-mono text-[9px] font-semibold uppercase leading-snug tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      {f.pillar}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              id={panelId}
              role="tabpanel"
              aria-labelledby={tabIds[activeIndex >= 0 ? activeIndex : 0]}
              className="relative mt-8 min-h-[9rem] rounded-xl border border-slate-200/70 bg-gradient-to-b from-slate-50/90 to-white px-6 py-8 dark:border-slate-600/50 dark:from-slate-800/50 dark:to-slate-900/30 md:px-8 md:py-9"
            >
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-aura-coral/15 to-aura-violet/10 blur-3xl"
                aria-hidden
              />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
                  transition={{ duration: reduceMotion ? 0.01 : 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8"
                >
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white to-slate-50 text-base font-semibold tracking-tight text-gradient shadow-inner dark:border-slate-600 dark:from-slate-800 dark:to-slate-900"
                    aria-hidden
                  >
                    {active.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                      {active.pillar} · {active.pillarDetail}
                    </p>
                    <blockquote className="mt-3 text-[17px] font-medium leading-relaxed text-slate-800 dark:text-slate-200 md:text-lg md:leading-relaxed">
                      &ldquo;{active.note}&rdquo;
                    </blockquote>
                    <p className="mt-5 text-sm font-semibold text-aura-ink dark:text-slate-100">— {active.firstName}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <motion.footer
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-30px" }}
          variants={fadeUp}
          transition={{ delay: reduceMotion ? 0 : 0.12 }}
          className="mx-auto mt-16 max-w-3xl border-t border-slate-200/80 pt-10 dark:border-slate-700/80"
        >
          <p className="text-[15px] leading-loose text-slate-600 dark:text-slate-400 md:text-base md:leading-loose">{FOUNDERS_NOTE.signOff}</p>
          <p className="mt-6 font-semibold tracking-tight text-aura-ink dark:text-slate-200">{FOUNDERS_NOTE.signOffAttribution}</p>
        </motion.footer>
      </div>
    </section>
  );
}
