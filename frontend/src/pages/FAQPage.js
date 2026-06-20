import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import FAQSection from "../components/landing/FAQSection";
import SiteFooter from "../components/SiteFooter";
import { FAQ_ITEMS } from "../data/marketing";

export default function FAQPage() {
  useEffect(() => {
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    };
    const id = "faq-page-jsonld";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(faqJsonLd);
    document.head.appendChild(script);
    return () => document.getElementById(id)?.remove();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="page-shell max-w-3xl pb-16 pt-4 md:pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 no-underline transition-colors hover:text-aura-ink dark:text-slate-400 dark:hover:text-slate-100"
        >
          ← Home
        </Link>

        <header className="relative mt-8 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-900/5 ring-1 ring-white/70 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/70 dark:ring-slate-700/50 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-violet-500/15 to-aura-coral/15 blur-3xl"
          />
          <div className="relative">
            <div className="section-eyebrow mb-4 w-fit">FAQ</div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-aura-ink sm:text-4xl md:text-[2.65rem]">
              Answers before you sign up
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
              Security, browsers, and how AI fits into real prep — everything you need to know before your
              first mock interview.
            </p>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Data handling details live on our{" "}
              <Link
                to="/privacy"
                className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900 dark:text-violet-400 dark:decoration-violet-500/50 dark:hover:text-violet-300"
              >
                Privacy page
              </Link>
              .
            </p>
          </div>
        </header>

        <div className="mt-10">
          <FAQSection showHeader={false} />
        </div>

        <div className="mt-10 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-6 py-5 text-center dark:border-slate-700/70 dark:bg-slate-900/45">
          <p className="text-sm font-semibold text-aura-ink dark:text-slate-100">Still have questions?</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Re-read our{" "}
            <Link
              to="/privacy"
              className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 dark:text-violet-400 dark:decoration-violet-500/50 dark:hover:text-violet-300"
            >
              Privacy
            </Link>{" "}
            page or open a support thread from your institution — we’re small but we care about clarity.
          </p>
          <Link to="/register" className="btn-primary mt-5 inline-flex no-underline">
            Start free mock interview
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
