import React, { useState } from "react";
import { Link } from "react-router-dom";

// Marketing footer columns grouped by user intent so visitors find what they need fast.
const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/#features" },
      { label: "How it works", to: "/#how-it-works" },
      { label: "Pricing", to: "/pricing" },
      { label: "Changelog", to: "/#whats-new" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Software engineering", to: "/#use-cases" },
      { label: "Product management", to: "/#use-cases" },
      { label: "Finance & consulting", to: "/#use-cases" },
      { label: "New grads", to: "/#use-cases" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", to: "/faq" },
      { label: "Security & privacy", to: "/privacy" },
      { label: "Terms of service", to: "/terms" },
      { label: "Contact", to: "mailto:hello@interviewai.app", external: true },
    ],
  },
];

const socials = [
  {
    label: "GitHub",
    href: "https://github.com/sagarkadam7/mock-interview-ai",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
        <path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.94c.58.11.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.74.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.27 5.67.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5z" />
      </svg>
    ),
  },
  {
    label: "X (Twitter)",
    href: "https://x.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
        <path d="M18.244 2H21l-6.58 7.52L22 22h-6.86l-4.69-6.14L4.98 22H2.23l7.03-8.04L2 2h6.97l4.23 5.57L18.244 2zm-1.2 18h1.9L7.02 4h-2.02l12.04 16z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-4 w-4">
        <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S.02 4.88.02 3.5 1.14 1 2.5 1s2.48 1.12 2.48 2.5zM.2 8h4.6v14H.2V8zm7.8 0h4.4v2.02h.06c.61-1.15 2.1-2.36 4.33-2.36 4.63 0 5.48 3.05 5.48 7.02V22h-4.58v-6.3c0-1.5-.03-3.44-2.1-3.44-2.1 0-2.42 1.64-2.42 3.33V22H8V8z" />
      </svg>
    ),
  },
];

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubscribe = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    // Minimal email validation — avoid extra deps; server will re-validate.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/marketing/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Subscription failed.");
      }
      setSubscribed(true);
      setEmail("");
    } catch (err) {
      setError(err?.message || "Subscription failed.");
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer
      role="contentinfo"
      className="relative border-t border-slate-200/80 bg-gradient-to-b from-slate-50/90 to-aura-page dark:border-slate-800/80 dark:from-slate-950/90 dark:to-aura-page"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        {/* Newsletter CTA */}
        <div className="mb-14 grid gap-10 rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-md transition-[box-shadow,border-color,transform] duration-300 ease-out hover:border-violet-200/90 hover:shadow-[0_24px_60px_-28px_rgba(91,33,182,0.18)] dark:border-slate-700/70 dark:bg-slate-900/60 dark:hover:border-violet-500/35 dark:hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.45)] md:grid-cols-[1.2fr_1fr] md:items-center md:p-10">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-violet-700 dark:text-violet-300">
              The Loop Newsletter
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-tight text-aura-ink md:text-3xl">
              Interview prep tactics, one email a week.
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Concrete frameworks, teardown stories, and the practice patterns our most successful candidates use.
              No fluff. Unsubscribe in one click.
            </p>
          </div>
          <form className="flex flex-col gap-3" onSubmit={onSubscribe} noValidate>
            <label htmlFor="footer-email" className="visually-hidden">
              Email address
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="footer-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setSubscribed(false);
                }}
                placeholder="you@work.com"
                className="flex-1 rounded-full border border-slate-200/90 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:border-slate-600/80 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:ring-violet-500/30"
                aria-invalid={!!error}
                aria-describedby={error ? "footer-email-error" : undefined}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-aura-ink px-6 py-3 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.97] hover:shadow-lg disabled:opacity-70 dark:bg-slate-100 dark:text-slate-900"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Subscribing…" : "Subscribe"}
              </button>
            </div>
            {error && (
              <p id="footer-email-error" role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {error}
              </p>
            )}
            {subscribed && (
              <p role="status" className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                You're in. Check your inbox for a confirmation.
              </p>
            )}
          </form>
        </div>

        {/* Main footer grid */}
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 no-underline transition-colors hover:text-aura-ink dark:text-slate-400 dark:hover:text-slate-100"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-aura-coral to-aura-violet text-xs font-black text-white shadow-lg shadow-aura-violet/20">
                IA
              </span>
              InterviewAI
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Mock interviews with resume-aware AI, live delivery analytics, and exportable reports — built for
              candidates who care about signal.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={s.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-700 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-400 dark:hover:text-violet-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                {col.title}
              </div>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.external ? (
                      <a
                        href={l.to}
                        className="text-sm font-medium text-slate-600 underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-aura-ink hover:decoration-violet-500/70 dark:text-slate-400 dark:hover:text-slate-100"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        to={l.to}
                        className="text-sm font-medium text-slate-600 underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:text-aura-ink hover:decoration-violet-500/70 dark:text-slate-400 dark:hover:text-slate-100"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-200/80 pt-8 text-center dark:border-slate-800/80 sm:flex-row sm:text-left">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} InterviewAI · All rights reserved
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Crafted for serious interview practice.</p>
        </div>
      </div>
    </footer>
  );
}
