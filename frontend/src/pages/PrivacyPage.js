import React from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
    <div className="page-shell max-w-3xl pb-16 pt-4">
      <Link
        to="/"
        className="mb-10 inline-flex text-sm font-medium text-slate-500 no-underline transition-colors hover:text-aura-ink dark:text-slate-400 dark:hover:text-slate-100"
      >
        ← Home
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        <section>
          <h2 className="text-lg font-bold text-aura-ink">What we collect</h2>
          <p className="mt-3">
            Account information (name, email, password hash), interview content you submit (job descriptions, resume text, answers, and derived scores), and technical metadata needed to run the service (e.g. timestamps, session identifiers).
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-aura-ink">Resume files</h2>
          <p className="mt-3">
            If you upload a PDF, the file is processed to extract text and is not retained as a long-term attachment after parsing completes. Plain text derived from your resume may be stored with your interview record so you can review sessions.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-aura-ink">AI processing</h2>
          <p className="mt-3">
            We use third-party AI providers (e.g. Google Gemini) to generate questions and feedback. Do not paste secrets, government IDs, or highly sensitive personal data into free-form fields.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-aura-ink">Security</h2>
          <p className="mt-3">
            Passwords are hashed. APIs use signed tokens (JWT). You should deploy the application over HTTPS in production so data in transit is encrypted.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-aura-ink">Your choices</h2>
          <p className="mt-3">Delete interviews from your dashboard when you no longer need them. Contact your deployment operator to request full account deletion if self-service removal is not available.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-aura-ink">Contact</h2>
          <p className="mt-3">For privacy questions related to this deployment, contact the administrator of your instance.</p>
        </section>
      </div>
    </div>
    <SiteFooter />
    </div>
  );
}
