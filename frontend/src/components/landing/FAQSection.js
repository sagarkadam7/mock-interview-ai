import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FAQ_ITEMS } from "../../data/marketing";

function Item({ item, open, onToggle, idx }) {
  const id = `faq-${idx}`;
  return (
    <div className="border-b border-slate-200/90 last:border-0 dark:border-slate-700/80">
      <button
        type="button"
        id={`${id}-btn`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 py-5 text-left transition-colors hover:text-violet-800 dark:hover:text-violet-300"
      >
        <span className="text-[15px] font-semibold text-aura-ink">{item.q}</span>
        <span className={`mt-0.5 shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500 ${open ? "rotate-180" : ""}`} aria-hidden>
          ▼
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-btn`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection({ limit = null }) {
  const baseItems = limit != null ? FAQ_ITEMS.slice(0, limit) : FAQ_ITEMS;
  const [openIdx, setOpenIdx] = useState(0);
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return baseItems;
    return baseItems.filter((x) => `${x.q} ${x.a}`.toLowerCase().includes(q));
  }, [baseItems, query]);

  return (
    <section id="faq" className="scroll-mt-24 border-t border-slate-200/80 bg-white py-24 dark:border-slate-800/80 dark:bg-slate-950 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <div className="section-eyebrow mx-auto mb-4">FAQ</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Answers before you sign up</h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-slate-600 dark:text-slate-400">Security, browsers, and how AI fits into real prep.</p>
        </div>

        <div className="mb-6">
          <label htmlFor="faq-search" className="visually-hidden">
            Search questions
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden>
              ⌕
            </span>
            <input
              id="faq-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenIdx(-1);
              }}
              placeholder="Search: browsers, privacy, resume, eye contact…"
              className="w-full rounded-2xl border border-slate-200/90 bg-white/90 py-3 pl-10 pr-10 text-sm text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/30"
              aria-label="Search FAQ"
            />
            {query.trim() && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setOpenIdx(0);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
            {query.trim() ? (
              <>
                Showing <span className="font-semibold">{items.length}</span> result{items.length === 1 ? "" : "s"} for{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-200">“{query.trim()}”</span>.
              </>
            ) : (
              <>
                Tip: use search to find answers fast. <span className="hidden sm:inline">Try “privacy” or “browser”.</span>
              </>
            )}
          </p>
        </div>

        <div className="glass-panel-lg rounded-2xl px-6 md:px-10">
          {items.length ? (
            items.map((item, i) => (
              <Item
                key={item.q}
                idx={i}
                item={item}
                open={openIdx === i}
                onToggle={() => setOpenIdx((prev) => (prev === i ? -1 : i))}
              />
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-aura-ink dark:text-slate-100">No matches found.</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Try a different search, or read our{" "}
                <Link
                  to="/privacy"
                  className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900 dark:text-violet-300"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          )}
        </div>

        {limit != null && (
          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <Link
              to="/faq"
              className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900 dark:text-violet-400 dark:decoration-violet-500/50 dark:hover:text-violet-300"
            >
              View all questions →
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
