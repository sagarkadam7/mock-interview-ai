import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, useReducedMotion } from "framer-motion";
import LandingHero from "../components/landing/LandingHero";
import TrustLogoRail from "../components/landing/TrustLogoRail";
import LandingSectionSkeleton from "../components/landing/LandingSectionSkeleton";

const HowItWorksSection = lazy(() => import("../components/landing/HowItWorksSection"));
const ComparisonSection = lazy(() => import("../components/landing/ComparisonSection"));
const TestimonialsSection = lazy(() => import("../components/landing/TestimonialsSection"));
const PricingTeaserSection = lazy(() => import("../components/landing/PricingTeaserSection"));
const SecuritySection = lazy(() => import("../components/landing/SecuritySection"));
const FounderLetterSection = lazy(() => import("../components/landing/FounderLetterSection"));
const UseCasesSection = lazy(() => import("../components/landing/UseCasesSection"));
const SiteFooter = lazy(() => import("../components/SiteFooter"));

/* ─── DATA ───────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    num: "01",
    title: "Résumé-aware questions",
    body: "Every prompt is grounded in your PDF and the job description you paste — never a generic question bank.",
    accent: "#e85547",
  },
  {
    num: "02",
    title: "Camera presence telemetry",
    body: "Gaze and posture are measured at 30 fps so you rebuild composure before the room does it for you.",
    accent: "#5b21b6",
  },
  {
    num: "03",
    title: "Deterministic scorecards",
    body: "Structured 0–10 feedback you can rehearse against — strengths, gaps, and a clear next step per answer.",
    accent: "#5b21b6",
  },
  {
    num: "04",
    title: "Adaptive follow-ups",
    body: "When an answer has room to go deeper, Gemini probes metrics, ownership, or tradeoffs — once, sharply.",
    accent: "#e85547",
    badge: "New",
  },
];

const BODY_FONT_STACK = "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";

/* ─── HELPERS ────────────────────────────────────────────────────────── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

/** Gradient-filled text — needs standard `backgroundClip` + `backgroundImage` or some browsers paint a solid bar. */
function gradientTextStyle(coral, violet, { angle = "135deg", fontStyle } = {}) {
  return {
    display: "inline-block",
    maxWidth: "100%",
    backgroundImage: `linear-gradient(${angle}, ${coral}, ${violet})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "transparent",
    ...(fontStyle ? { fontStyle } : {}),
  };
}

/* ─── GRAIN OVERLAY ──────────────────────────────────────────────────── */
function Grain() {
  const { theme } = useTheme();
  const opacity = theme === "dark" ? 0.035 : 0.018;
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        opacity,
      }}
    />
  );
}

/* ─── EDITORIAL DIVIDER ──────────────────────────────────────────────── */
function EditorialDivider() {
  const { palette: C } = useTheme();
  return (
    <div
      aria-hidden
      style={{
        maxWidth: 1120,
        margin: "0 auto",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.border} 18%, ${C.border} 82%, transparent)`,
        }}
      />
    </div>
  );
}

/* ─── SECTION LABEL ──────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  const { palette: C } = useTheme();
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "'DM Mono', monospace",
        fontSize: 10.5,
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: C.muted,
        opacity: 0.75,
        marginBottom: 18,
      }}
    >
      {children}
    </span>
  );
}

/* ─── FEATURE CARD ───────────────────────────────────────────────────── */
function FeatureCard({ f, idx }) {
  const { palette: C } = useTheme();
  const [ref, visible] = useInView();
  const [hovered, setHovered] = useState(false);
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 36, scale: reduceMotion ? 1 : 0.985 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{
        duration: reduceMotion ? 0.2 : 0.65,
        delay: reduceMotion ? 0 : idx * 0.09,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        padding: "28px 24px",
        background: C.card,
        border: `1px solid ${hovered ? f.accent + "33" : C.border}`,
        boxShadow: hovered ? `0 14px 40px ${f.accent}10` : C.cardShadow,
        transition:
          "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.28s cubic-bezier(0.16,1,0.3,1)",
        cursor: "default",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      <motion.div
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={visible ? { scaleX: hovered ? 1 : 0.65 } : {}}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          transformOrigin: "left center",
          background: `linear-gradient(90deg, ${f.accent}, ${f.accent}88)`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            fontWeight: 700,
            color: f.accent,
            letterSpacing: "0.18em",
            opacity: 0.85,
          }}
        >
          {f.num}
        </span>
        {f.badge ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: 999,
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: f.accent,
              background: `${f.accent}1a`,
              border: `1px solid ${f.accent}33`,
            }}
          >
            {f.badge}
          </span>
        ) : null}
      </div>
      <h3
        style={{
          fontFamily: BODY_FONT_STACK,
          fontSize: 20,
          fontWeight: 700,
          color: C.ink,
          marginBottom: 10,
          lineHeight: 1.25,
        }}
      >
        {f.title}
      </h3>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, fontFamily: BODY_FONT_STACK }}>{f.body}</p>
    </motion.div>
  );
}

/* ─── CTA BUTTON ─────────────────────────────────────────────────────── */
function CtaButton({ to, children }) {
  const { palette: C } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      style={{ textDecoration: "none" }}
      className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-500/55 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <motion.span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileTap={{ scale: 0.98 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 34px",
          borderRadius: 999,
          background: hovered
            ? `linear-gradient(135deg, ${C.violet}, ${C.coral})`
            : `linear-gradient(135deg, ${C.coral}, ${C.violet})`,
          color: "white",
          fontFamily: BODY_FONT_STACK,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-0.005em",
          textTransform: "none",
          cursor: "pointer",
          boxShadow: hovered ? `0 18px 48px ${C.coral}40, 0 0 0 1px ${C.coral}26` : `0 8px 28px ${C.coral}24`,
          transition: "box-shadow 0.3s ease, background 0.3s ease",
        }}
      >
        {children}
        <span style={{ fontSize: 18 }}>→</span>
      </motion.span>
    </Link>
  );
}

/* ─── GHOST BUTTON ───────────────────────────────────────────────────── */
function GhostButton({ to, children }) {
  const { palette: C } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      style={{ textDecoration: "none" }}
      className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-500/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "15px 30px",
          borderRadius: 999,
          border: `1px solid ${hovered ? C.ink : C.border}`,
          color: hovered ? C.ink : C.muted,
          fontFamily: BODY_FONT_STACK,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          textTransform: "none",
          transition: "all 0.25s ease",
          cursor: "pointer",
          background: hovered ? `${C.ink}05` : "transparent",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = C.ink)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = C.border)}
      >
        {children}
      </span>
    </Link>
  );
}

/* ─── PAGE ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user } = useAuth();
  const { palette: C } = useTheme();
  const reduceMotion = useReducedMotion();
  const location = useLocation();

  useEffect(() => {
    // Inject fonts
    if (!document.getElementById("lp-fonts")) {
      const link = document.createElement("link");
      link.id = "lp-fonts";
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Hint the browser to fetch the most visible landing assets sooner.
  useEffect(() => {
    const preconnect = (href) => {
      if (document.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
      const l = document.createElement("link");
      l.rel = "preconnect";
      l.href = href;
      document.head.appendChild(l);
    };
    preconnect("https://fonts.googleapis.com");
    preconnect("https://fonts.gstatic.com");
  }, []);

  // Light prefetch of the likely next navigation targets from the landing page.
  // Uses requestIdleCallback to avoid blocking initial render.
  useEffect(() => {
    const w = window;
    const idle = w.requestIdleCallback || ((cb) => setTimeout(cb, 750));
    const cancelIdle = w.cancelIdleCallback || clearTimeout;
    const id = idle(() => {
      try {
        import("./PricingPage");
        import("./FAQPage");
      } catch {
        // ignore
      }
    });
    return () => cancelIdle(id);
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el)
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
      );
  }, [location.hash, reduceMotion]);

  useEffect(() => {
    const id = "lp-jsonld-website";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "InterviewAI",
      description: "Résumé-aware mock interviews with live presence coaching and structured scorecards.",
      url: window.location.origin,
    });
    document.head.appendChild(script);
    return () => document.getElementById(id)?.remove();
  }, []);

  return (
    <div style={{ background: C.paper, color: C.ink, overflowX: "hidden", minHeight: "100vh" }}>
      <Grain />

      {/* ── HERO (original component preserved) ── */}
      <LandingHero user={user} />

      {/* ── TRUST STRIP: headline + marquee only, aligned to page grid ── */}
      <section
        aria-label="Trusted by"
        style={{
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(180deg, ${C.paper} 0%, ${C.band}08 50%, ${C.paper} 100%)`,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage: `
              url("data:image/svg+xml,%3Csvg width='760' height='180' viewBox='0 0 760 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%235b21b6' stroke-opacity='.16' stroke-width='1.2'%3E%3Cpath d='M46 112 C158 24 236 150 348 74 S542 28 706 114'/%3E%3Cpath d='M82 48 C186 96 244 18 336 62 S482 130 628 54'/%3E%3C/g%3E%3Cg fill='%23e85547' fill-opacity='.22'%3E%3Ccircle cx='46' cy='112' r='4'/%3E%3Ccircle cx='348' cy='74' r='4'/%3E%3Ccircle cx='706' cy='114' r='4'/%3E%3C/g%3E%3Cg fill='%235b21b6' fill-opacity='.2'%3E%3Ccircle cx='82' cy='48' r='3'/%3E%3Ccircle cx='336' cy='62' r='3'/%3E%3Ccircle cx='628' cy='54' r='3'/%3E%3C/g%3E%3C/svg%3E"),
              radial-gradient(ellipse 55% 80% at 12% 50%, ${C.coral}0c 0%, transparent 55%),
              radial-gradient(ellipse 50% 70% at 88% 50%, ${C.violet}0a 0%, transparent 55%)
            `,
            backgroundPosition: "center, center, center",
            backgroundRepeat: "no-repeat, no-repeat, no-repeat",
            backgroundSize: "min(760px, 92vw) auto, auto, auto",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 sm:py-14 lg:px-8"
        >
          <div className="mb-1 text-center">
            <SectionLabel>Campus & engineering programs</SectionLabel>
          </div>
          <div className="w-full min-w-0">
            <TrustLogoRail />
          </div>
          <div
            className="mt-7 flex flex-wrap items-center justify-center gap-2"
            aria-label="Trust strip highlights"
          >
            {["Built for campus loops", "Resume-aware practice", "Private scorecards"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/55 dark:text-slate-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" aria-hidden />
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      <EditorialDivider />

      {/* ── HOW IT WORKS (original) ── */}
      <Suspense fallback={<LandingSectionSkeleton minHeight={360} />}>
        <HowItWorksSection />
      </Suspense>

      {/* ── USE CASES ── */}
      <Suspense fallback={<LandingSectionSkeleton minHeight={400} />}>
        <UseCasesSection />
      </Suspense>

      {/* ── FEATURES GRID ── */}
      <section
        id="features"
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "96px 24px",
          scrollMarginTop: "5.5rem",
          position: "relative",
        }}
      >
        <div id="whats-new" className="sr-only" aria-hidden>
          What&apos;s new
        </div>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "38px -80px auto",
            height: 420,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='860' height='420' viewBox='0 0 860 420' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%235b21b6' stroke-opacity='.1' stroke-width='1'%3E%3Cpath d='M80 80H300V190H430V118H760'/%3E%3Cpath d='M120 318H330V238H520V316H760'/%3E%3Crect x='188' y='134' width='98' height='56' rx='14'/%3E%3Crect x='540' y='92' width='116' height='66' rx='16'/%3E%3Crect x='420' y='250' width='126' height='62' rx='16'/%3E%3C/g%3E%3Cg fill='%23e85547' fill-opacity='.14'%3E%3Ccircle cx='300' cy='190' r='5'/%3E%3Ccircle cx='520' cy='316' r='5'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
            backgroundSize: "min(860px, 115vw) auto",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            textAlign: "center",
            marginBottom: 64,
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
            position: "relative",
          }}
        >
          <SectionLabel>What's inside</SectionLabel>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.85rem, 3.6vw, 2.65rem)",
              fontWeight: 600,
              color: C.ink,
              lineHeight: 1.2,
              letterSpacing: "-0.018em",
              margin: 0,
            }}
          >
            Four primitives. One sharper round.
          </h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            position: "relative",
          }}
        >
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.num} f={f} idx={i} />
          ))}
        </div>
      </section>

      <EditorialDivider />

      {/* ── COMPARISON (original) ── */}
      <Suspense fallback={<LandingSectionSkeleton />}>
        <ComparisonSection />
      </Suspense>

      {/* ── FOUNDER LETTER (original) ── */}
      <Suspense fallback={<LandingSectionSkeleton />}>
        <FounderLetterSection />
      </Suspense>

      {/* ── TESTIMONIALS (original) ── */}
      <Suspense fallback={<LandingSectionSkeleton />}>
        <TestimonialsSection />
      </Suspense>

      {/* ── PRICING (original) ── */}
      <Suspense fallback={<LandingSectionSkeleton />}>
        <PricingTeaserSection />
      </Suspense>

      {/* ── SECURITY (original) ── */}
      <Suspense fallback={<LandingSectionSkeleton />}>
        <SecuritySection />
      </Suspense>

      {/* ── FINAL CTA ── */}
      <FinalCta user={user} />

      <Suspense fallback={<LandingSectionSkeleton />}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}

/* ─── FINAL CTA SECTION ──────────────────────────────────────────────── */
function FinalCta({ user }) {
  const { palette: C } = useTheme();
  const [ref, visible] = useInView(0.1);
  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "112px 24px 96px",
        background: C.band,
        textAlign: "center",
      }}
    >
      {/* bg mesh — single soft layer */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
          url("data:image/svg+xml,%3Csvg width='940' height='420' viewBox='0 0 940 420' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='.1' stroke-width='1.2'%3E%3Cpath d='M120 288 C240 108 360 342 470 188 S690 80 820 254'/%3E%3Ccircle cx='256' cy='182' r='92'/%3E%3Ccircle cx='682' cy='210' r='118'/%3E%3Cpath d='M320 260h300' stroke-dasharray='10 14'/%3E%3C/g%3E%3Cg fill='%23e85547' fill-opacity='.16'%3E%3Ccircle cx='120' cy='288' r='7'/%3E%3Ccircle cx='470' cy='188' r='7'/%3E%3Ccircle cx='820' cy='254' r='7'/%3E%3C/g%3E%3C/svg%3E"),
          radial-gradient(ellipse 85% 65% at 28% 45%, ${C.coral}12 0%, transparent 52%),
          radial-gradient(ellipse 75% 60% at 78% 52%, ${C.violet}10 0%, transparent 55%)
        `,
          backgroundPosition: "center, center, center",
          backgroundRepeat: "no-repeat, no-repeat, no-repeat",
          backgroundSize: "min(940px, 112vw) auto, auto, auto",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 2, maxWidth: 720, margin: "0 auto" }}
      >
        <SectionLabel>Begin</SectionLabel>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem, 4.4vw, 2.85rem)",
            fontWeight: 600,
            color: "white",
            lineHeight: 1.18,
            letterSpacing: "-0.02em",
            margin: "0 auto 24px",
            maxWidth: 720,
          }}
        >
          Walk into the next round{" "}
          <span style={{ fontStyle: "italic", color: C.coral }}>already calibrated.</span>
        </h2>
        <p
          style={{
            fontFamily: BODY_FONT_STACK,
            fontSize: 15.5,
            color: C.muted,
            lineHeight: 1.75,
            maxWidth: 520,
            margin: "0 auto 40px",
          }}
        >
          One session takes about twelve minutes. The signal compounds.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <CtaButton to={user ? "/interview/new" : "/register"}>
            {user ? "Start new interview" : "Create free account"}
          </CtaButton>
          <GhostButton to="/pricing">View pricing</GhostButton>
        </div>

        <p
          style={{
            marginTop: 28,
            fontFamily: BODY_FONT_STACK,
            fontSize: 12.5,
            color: C.marqueeText,
          }}
        >
          Free plan, no card, cancel any time.
        </p>
      </motion.div>
    </section>
  );
}
