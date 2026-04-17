import React from "react";
import { Link } from "react-router-dom";
import SiteFooter from "../components/SiteFooter";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
    <div className="page-shell max-w-3xl pb-16 pt-4">
      <Link to="/" className="mb-10 inline-flex text-sm font-medium text-slate-500 no-underline hover:text-aura-ink">
        ← Home
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-aura-ink md:text-4xl">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-bold text-aura-ink">Acceptance</h2>
          <p className="mt-3">
            By creating an account or using InterviewAI, you agree to these terms. If you deploy your own instance, your organization may publish supplemental policies.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-aura-ink">The service</h2>
          <p className="mt-3">
            InterviewAI provides practice tools and AI-generated feedback. It does not guarantee job offers or interview outcomes. Coaching metrics (e.g. eye contact estimates) are heuristic and not medical or psychological advice.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-aura-ink">Acceptable use</h2>
          <p className="mt-3">
            Do not abuse APIs, attempt to access other users’ data, or upload unlawful content. We may rate-limit or suspend accounts that degrade service for others.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-aura-ink">Third parties</h2>
          <p className="mt-3">The product relies on infrastructure and AI vendors (hosting, database, model APIs). Their terms may apply to subprocessors they use.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-aura-ink">Disclaimer</h2>
          <p className="mt-3">
            The service is provided “as is” without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect or consequential damages arising from use of the product.
          </p>
        </section>
      </div>
    </div>
    <SiteFooter />
    </div>
  );
}
