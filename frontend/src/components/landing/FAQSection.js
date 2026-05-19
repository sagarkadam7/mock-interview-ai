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

function Item({ item, open, onToggle, idx }) {
  const id = `faq-${idx}`;
  return (
    <div
      className={`border-b border-slate-200/90 transition-[border-color,background-color] duration-200 last:border-0 dark:border-slate-700/80 ${
        open ? "border-l-[3px] border-l-violet-500 bg-violet-50/40 pl-4 dark:border-l-violet-400 dark:bg-violet-950/20" : "border-l-[3px] border-l-transparent pl-4"
      }`}
    >
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
        className="flex w-full items-start justify-between gap-4 rounded-xl py-5 text-left transition-colors hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:hover:text-violet-300 dark:focus-visible:ring-violet-500/50 dark:focus-visible:ring-offset-slate-950"
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
    <section id="faq" className="scroll-mt-24 border-t border-slate-200/80 bg-white py-24 dark:border-slate-800/80 dark:bg-slate-950 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <div className="section-eyebrow mx-auto mb-4">FAQ</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Answers before you sign up</h2>
          <p className="mx-auto mt-4 max-w-lg text-[15px] text-slate-600 dark:text-slate-400">Security, browsers, and how AI fits into real prep.</p>
        </div>

        <div className="mb-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Filter FAQ by topic">
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
                setTopic("all");
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
