import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FAQ_ITEMS } from "../../data/marketing";

const FAQ_TOPICS = [
  { id: "all", label: "All" },
  { id: "privacy", label: "Privacy", test: /privacy|data|delete|record|secure/i },
  { id: "product", label: "Product", test: /resume|question|score|session|interview/i },
  { id: "tech", label: "Tech", test: /browser|camera|speech|chrome|https/i },
];

function Chevron({ open }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500 ${open ? "rotate-180" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.preventDefault();
            onToggle();
          }
        }}
        className={`flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-inset dark:focus-visible:ring-violet-500/50 sm:px-6 ${
          open ? "bg-violet-50/60 dark:bg-violet-950/25" : "hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
        }`}
      >
        <span className="text-[15px] font-semibold leading-snug text-aura-ink dark:text-slate-100">
          {item.q}
        </span>
        <Chevron open={open} />
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
            <p className="border-t border-violet-200/50 px-5 pb-5 pt-4 text-sm leading-relaxed text-slate-600 dark:border-violet-500/20 dark:text-slate-400 sm:px-6">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection({ limit = null, showHeader = true }) {
  const baseItems = limit != null ? FAQ_ITEMS.slice(0, limit) : FAQ_ITEMS;
  const [openIdx, setOpenIdx] = useState(0);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const topicDef = FAQ_TOPICS.find((t) => t.id === topic);
    return baseItems.filter((x) => {
      const text = `${x.q} ${x.a}`;
      const topicOk = topic === "all" || !topicDef?.test || topicDef.test.test(text);
      const searchOk = !q || text.toLowerCase().includes(q);
      return topicOk && searchOk;
    });
  }, [baseItems, query, topic]);

  return (
    <div id="faq" className={showHeader ? "scroll-mt-24" : undefined}>
      {showHeader && (
        <div className="mb-10 text-center md:mb-12">
          <div className="section-eyebrow mx-auto mb-4">FAQ</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">
            Answers before you sign up
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Security, browsers, and how AI fits into real prep.
          </p>
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter FAQ by topic">
        {FAQ_TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTopic(t.id);
              setOpenIdx(0);
            }}
            className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 ${
              topic === t.id
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/25 dark:bg-violet-500"
                : "border border-slate-200/90 bg-white/90 text-slate-600 hover:border-violet-300 hover:text-violet-700 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:text-violet-300"
            }`}
            aria-pressed={topic === t.id}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-6">
        <label htmlFor="faq-search" className="visually-hidden">
          Search questions
        </label>
        <div className="relative">
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            fill="currentColor"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpenIdx(-1);
              setTopic("all");
            }}
            placeholder="Search: browsers, privacy, resume, eye contact…"
            className="w-full rounded-xl border border-slate-200/90 bg-white py-3 pl-10 pr-10 text-sm text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/30"
            aria-label="Search FAQ"
          />
          {query.trim() && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setOpenIdx(0);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
          {query.trim() ? (
            <>
              Showing <span className="font-semibold">{items.length}</span> result
              {items.length === 1 ? "" : "s"} for{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">“{query.trim()}”</span>.
            </>
          ) : (
            <>
              {items.length} question{items.length === 1 ? "" : "s"}
              {topic !== "all" ? ` in ${FAQ_TOPICS.find((t) => t.id === topic)?.label}` : ""}. Try “privacy”
              or “browser”.
            </>
          )}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-700/80 dark:bg-slate-900/50">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-5 py-3.5 dark:border-slate-700/80 dark:bg-slate-900/60 sm:px-6">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {topic === "all" ? "All questions" : `${FAQ_TOPICS.find((t) => t.id === topic)?.label} questions`}
          </span>
          <span className="rounded-full border border-slate-200/80 bg-white px-2.5 py-0.5 text-xs font-semibold tabular-nums text-slate-600 dark:border-slate-700/80 dark:bg-slate-950/45 dark:text-slate-300">
            {items.length}
          </span>
        </div>

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
          <div className="px-6 py-12 text-center">
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
  );
}
