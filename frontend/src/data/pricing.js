/** Single source of truth for pricing copy across landing, /pricing, and SEO. */

export const PRICING_GUARANTEES = [
  "No credit card on Starter",
  "Cancel anytime",
  "3 free sessions / month",
  "Pro billing coming soon",
];

export const STARTER_PLAN = {
  id: "starter",
  name: "Starter",
  price: "$0",
  cadence: "/ month",
  tagline: "Everything you need to run serious reps — no credit card.",
  cta: { label: "Create free account", to: "/register" },
  perks: [
    "3 mock sessions / month (free plan cap)",
    "7 tailored questions per interview",
    "Resume-aware question generation",
    "Browser-native speech analytics",
    "PDF report export",
    "Dashboard history",
  ],
};

export const PRO_PLAN = {
  id: "pro",
  name: "Pro",
  priceMonthly: 12,
  priceAnnual: 9,
  tagline: "Unlimited practice + shareable signal for serious prep loops.",
  badge: "Most popular",
  cta: { label: "See Pro features", to: "/pricing" },
  registerCta: { label: "Create free account", to: "/register?plan=pro" },
  perks: [
    "Unlimited mock sessions",
    "AI Prep Brief — resume vs JD fit, gaps & STAR stories",
    "Shareable report links (send to mentors)",
    "Practice streaks + weekly goals",
    "Momentum insights: readiness snapshot + trends",
    "Early access to new analytics",
  ],
};

export const PRO_BILLING_DISCLAIMER =
  "Paid billing is not live yet. Pro upgrades in the app are for development and testing only until Stripe checkout ships.";
