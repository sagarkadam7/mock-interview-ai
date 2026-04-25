import React from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";

const timeline = [
  {
    step: "1) You provide context",
    detail: "Role, job description, and resume text (or an optional PDF upload).",
  },
  {
    step: "2) We generate your loop",
    detail: "Questions and rubric feedback are produced by an AI provider using your session context.",
  },
  {
    step: "3) You answer on camera",
    detail: "Speech and presence coaching run in the browser. Only the data needed for reports is stored.",
  },
  {
    step: "4) We store the scorecard",
    detail: "Your interview text + scores are saved to your account so you can review and export reports.",
  },
  {
    step: "5) You control retention",
    detail: "Delete interviews from your dashboard anytime. You can also request account deletion for your instance.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <div className="page-shell max-w-5xl pb-20 pt-4">
        <Link
          to="/"
          className="mb-10 inline-flex text-sm font-medium text-slate-500 no-underline transition-colors hover:text-aura-ink dark:text-slate-400 dark:hover:text-slate-100"
        >
          ← Home
        </Link>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-xl shadow-slate-900/5 ring-1 ring-white/70 backdrop-blur-md dark:border-slate-700/70 dark:bg-slate-900/70 dark:ring-slate-700/50 md:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-aura-coral/22 to-aura-violet/18 blur-3xl"
          />

          <div className="relative">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-violet-700 dark:text-violet-300">Privacy</p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-aura-ink md:text-5xl">
              Enterprise-Grade Privacy
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
              Interview data is sensitive. This page explains what we collect, how it’s processed, and how you control retention.
              We aim for clear language and minimal data handling.
            </p>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Last updated: {new Date().getFullYear()}</p>

            <div className="mt-10 grid gap-4 md:grid-cols-5">
              {timeline.map((t) => (
                <div key={t.step} className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/55">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{t.step}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{t.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <section className="glass-panel-lg rounded-3xl p-8 md:p-10">
            <h2 className="text-lg font-bold tracking-tight text-aura-ink dark:text-slate-100">What we collect</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Account information (name, email, password hash), interview content you submit (job descriptions, resume text, answers, and derived scores),
              and technical metadata needed to run the service (timestamps, identifiers).
            </p>
          </section>

          <section className="glass-panel-lg rounded-3xl p-8 md:p-10">
            <h2 className="text-lg font-bold tracking-tight text-aura-ink dark:text-slate-100">Resume files</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              If you upload a PDF, it’s processed to extract text and is not intended to be retained as a long-term attachment after parsing completes.
              Extracted resume text may be stored with your interview record so you can review sessions.
            </p>
          </section>

          <section className="glass-panel-lg rounded-3xl p-8 md:p-10">
            <h2 className="text-lg font-bold tracking-tight text-aura-ink dark:text-slate-100">AI processing</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              We use third‑party AI providers to generate questions and feedback. Don’t paste secrets, government IDs,
              or highly sensitive personal data into free‑form fields.
            </p>
          </section>

          <section className="glass-panel-lg rounded-3xl p-8 md:p-10">
            <h2 className="text-lg font-bold tracking-tight text-aura-ink dark:text-slate-100">Security</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Passwords are hashed. APIs use signed tokens (JWT). Deploy over HTTPS in production so data in transit is encrypted.
            </p>
          </section>
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200/80 bg-white/70 p-8 text-sm leading-relaxed text-slate-600 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/45 dark:text-slate-300 md:p-10">
          <h2 className="text-lg font-bold tracking-tight text-aura-ink dark:text-slate-100">Your choices</h2>
          <p className="mt-3">
            Delete interviews from your dashboard when you no longer need them. For full account deletion, contact the administrator of your instance.
          </p>
          <p className="mt-4">
            Questions? Email{" "}
            <a href="mailto:hello@interviewai.app" className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-4 hover:text-violet-900 dark:text-violet-300">
              hello@interviewai.app
            </a>
            .
          </p>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
