import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, useReducedMotion } from "framer-motion";
import { FAQ_ITEMS } from "../data/marketing";
import LandingHero from "../components/landing/LandingHero";
import TrustLogoRail from "../components/landing/TrustLogoRail";

const HowItWorksSection = lazy(() => import("../components/landing/HowItWorksSection"));
const ComparisonSection = lazy(() => import("../components/landing/ComparisonSection"));
const PersonasSection = lazy(() => import("../components/landing/PersonasSection"));
const TestimonialsSection = lazy(() => import("../components/landing/TestimonialsSection"));
const QuoteWallSection = lazy(() => import("../components/landing/QuoteWallSection"));
const PricingTeaserSection = lazy(() => import("../components/landing/PricingTeaserSection"));
const SecuritySection = lazy(() => import("../components/landing/SecuritySection"));
const FAQSection = lazy(() => import("../components/landing/FAQSection"));
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

const ENGINES = [
  {
    label: "Preparation outcome",
    name: "Role-aware interview strategy",
    detail: "Practice answers shaped to your resume and target role so every rep stays relevant.",
  },
  {
    label: "Presence outcome",
    name: "Camera confidence coaching",
    detail: "Build steadier eye contact and interview posture with instant visibility into habits.",
  },
  {
    label: "Communication outcome",
    name: "Real-time speech analytics",
    detail: "Hear how you sound in the moment, then tighten pacing and clarity before the real loop.",
  },
  {
    label: "Execution outcome",
    name: "Zero-latency behavioral feedback",
    detail: "Catch filler words and delivery drift instantly so corrections happen while context is fresh.",
  },
];

const TRUST_MARKS = ["IIT", "NIT", "SPPU", "VIT", "BITS", "IIIT"];

const STATS = [
  { value: "7", label: "questions tailored to your résumé and target role" },
  { value: "30 fps", label: "live gaze + presence telemetry as you speak" },
  { value: "0–10", label: "deterministic rubric scoring per answer" },
];

const BODY_FONT_STACK = "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";

/* ─── HELPERS ────────────────────────────────────────────────────────── */
const useInView = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
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
    <div aria-hidden style={{
      position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      opacity,
    }} />
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
    <span style={{
      display: "inline-block",
      fontFamily: "'DM Mono', monospace",
      fontSize: 10.5,
      fontWeight: 500,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: C.muted,
      opacity: 0.75,
      marginBottom: 18,
    }}>
      {children}
    </span>
  );
}

/* ─── MARQUEE ────────────────────────────────────────────────────────── */
function Marquee({ items, speed = 30 }) {
  const { palette: C } = useTheme();
  const doubled = [...items, ...items];
  return (
    <div style={{ overflow: "hidden", position: "relative", WebkitMaskImage: "linear-gradient(to right,transparent,black 15%,black 85%,transparent)" }}>
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, ease: "linear", duration: speed, repeatType: "loop" }}
        style={{ display: "flex", gap: 64, whiteSpace: "nowrap", width: "max-content" }}
      >
        {doubled.map((item, i) => (
          <span key={i} style={{
            fontFamily: BODY_FONT_STACK,
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: 600,
            color: C.marqueeText,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontStyle: "normal",
          }}>{item}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── STAT CARD ──────────────────────────────────────────────────────── */
function StatCard({ value, label, delay = 0, accentIndex = 0 }) {
  const { palette: C } = useTheme();
  const [ref, visible] = useInView();
  const [hovered, setHovered] = useState(false);
  const accent = accentIndex % 2 === 0 ? C.coral : C.violet;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        background: C.card,
        border: `1px solid ${hovered ? `${accent}44` : C.border}`,
        borderRadius: 20,
        padding: "32px 28px",
        textAlign: "center",
        boxShadow: hovered ? `0 18px 48px -16px ${accent}28, 0 1px 0 0 rgba(255,255,255,0.06) inset` : C.cardShadow,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s ease, border-color 0.28s ease",
      }}
    >
      <motion.div
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={visible ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, delay: delay + 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          transformOrigin: "left center",
          background: `linear-gradient(90deg, ${accent}, ${accentIndex % 2 === 0 ? C.violet : C.coral})`,
          opacity: hovered ? 1 : 0.85,
        }}
      />
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontStyle: "italic",
          fontSize: "clamp(2.25rem, 4vw, 2.85rem)",
          fontWeight: 600,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          marginBottom: 12,
          color: C.ink,
        }}
      >
        {value}
      </div>
      <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7, fontFamily: BODY_FONT_STACK }}>{label}</p>
    </motion.div>
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
        transition: "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.28s cubic-bezier(0.16,1,0.3,1)",
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          fontWeight: 700,
          color: f.accent,
          letterSpacing: "0.18em",
          opacity: 0.85,
        }}>{f.num}</span>
        {f.badge ? (
          <span style={{
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
          }}>{f.badge}</span>
        ) : null}
      </div>
      <h3 style={{
        fontFamily: BODY_FONT_STACK,
        fontSize: 20,
        fontWeight: 700,
        color: C.ink,
        marginBottom: 10,
        lineHeight: 1.25,
      }}>{f.title}</h3>
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
          boxShadow: hovered
            ? `0 18px 48px ${C.coral}40, 0 0 0 1px ${C.coral}26`
            : `0 8px 28px ${C.coral}24`,
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
      <span style={{
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
        onMouseEnter={e => e.currentTarget.style.borderColor = C.ink}
        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
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
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

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
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }));
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
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
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2" aria-label="Trust strip highlights">
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

      {/* ── STATS BAND ── */}
      <section
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "72px 24px 88px",
          position: "relative",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "8%",
            width: "min(90%, 640px)",
            height: "55%",
            transform: "translateX(-50%)",
            background: `radial-gradient(ellipse at center, ${C.violet}08 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          <SectionLabel>The product, in three numbers</SectionLabel>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.5rem, 3.2vw, 2rem)",
            fontWeight: 600,
            color: C.ink,
            letterSpacing: "-0.018em",
            margin: 0,
            lineHeight: 1.25,
          }}>
            What every session actually gives you.
          </h2>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}>
          {STATS.map((s, i) => <StatCard key={s.value} {...s} delay={i * 0.08} accentIndex={i} />)}
        </div>
        <div className="mx-auto mt-7 flex max-w-3xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-center text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/50 dark:text-slate-300">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">Every mock includes</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600 sm:inline-block" aria-hidden />
          <span>tailored questions, live delivery signals, and a scorecard you can export.</span>
        </div>
      </section>

      <EditorialDivider />

      {/* ── HOW IT WORKS (original) ── */}
      <Suspense fallback={null}>
        <HowItWorksSection />
      </Suspense>

      {/* ── USE CASES ── */}
      <Suspense fallback={null}>
        <UseCasesSection />
      </Suspense>

      {/* ── CORE ARCHITECTURE ── */}
      <section
        id="core-architecture"
        style={{
          padding: "80px 24px",
          background: C.band,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ambient orbs */}
        <div aria-hidden style={{
          position: "absolute", top: -120, left: "20%",
          width: 600, height: 600, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.coral}18, transparent 65%)`,
          pointerEvents: "none",
        }} />
        <div aria-hidden style={{
          position: "absolute", bottom: -80, right: "15%",
          width: 500, height: 500, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.violet}18, transparent 65%)`,
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ marginBottom: 56, maxWidth: 720 }}>
            <SectionLabel>Outcome engine</SectionLabel>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.85rem, 3.6vw, 2.65rem)",
              fontWeight: 600,
              color: "white",
              lineHeight: 1.18,
              letterSpacing: "-0.018em",
              margin: 0,
            }}>
              Four signals every loop runs through, before you walk into the real one.
            </h2>
          </div>

          {/* table */}
          <div style={{
            border: `1px solid rgba(255,255,255,0.08)`,
            borderRadius: 20,
            overflow: "hidden",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(10px)",
          }}>
            {/* header row — desktop table only; mobile uses stacked row labels */}
            <div
              className="hidden border-b border-white/[0.06] px-8 py-4 md:grid"
              style={{
                gridTemplateColumns: "auto minmax(0, 0.9fr) minmax(0, 1.45fr) minmax(0, 1fr)",
                gap: 24,
              }}
            >
              <span aria-hidden style={{ width: 28 }} />
              {["Candidate outcome", "Experience layer", "What improves"].map(h => (
                <span key={h} style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.3)",
                }}>{h}</span>
              ))}
            </div>
            {ENGINES.map((e, i) => (
              <EngineRowDark key={e.label} e={e} idx={i} isLast={i === ENGINES.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" style={{ maxWidth: 1120, margin: "0 auto", padding: "96px 24px", scrollMarginTop: "5.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: 64, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
          <SectionLabel>What's inside</SectionLabel>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.85rem, 3.6vw, 2.65rem)",
            fontWeight: 600,
            color: C.ink,
            lineHeight: 1.2,
            letterSpacing: "-0.018em",
            margin: 0,
          }}>
            Four primitives. One sharper round.
          </h2>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
        }}>
          {FEATURES.map((f, i) => <FeatureCard key={f.num} f={f} idx={i} />)}
        </div>
      </section>

      <EditorialDivider />

      {/* ── COMPARISON (original) ── */}
      <Suspense fallback={null}>
        <ComparisonSection />
      </Suspense>

      {/* ── FOUNDER LETTER (original) ── */}
      <Suspense fallback={null}>
        <FounderLetterSection />
      </Suspense>

      {/* ── PERSONAS (original) ── */}
      <Suspense fallback={null}>
        <PersonasSection />
      </Suspense>

      {/* ── QUOTE WALL + OUTCOMES ── */}
      <Suspense fallback={null}>
        <QuoteWallSection />
      </Suspense>

      {/* ── TESTIMONIALS (original) ── */}
      <Suspense fallback={null}>
        <TestimonialsSection />
      </Suspense>

      {/* ── PRICING (original) ── */}
      <Suspense fallback={null}>
        <PricingTeaserSection />
      </Suspense>

      {/* ── SECURITY (original) ── */}
      <Suspense fallback={null}>
        <SecuritySection />
      </Suspense>

      {/* ── FAQ (original) ── */}
      <Suspense fallback={null}>
        <FAQSection limit={4} />
      </Suspense>

      {/* ── FINAL CTA ── */}
      <FinalCta user={user} />

      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}

/* ─── ENGINE ROW DARK (inside dark section) ───────────────────────────── */
function EngineRowDark({ e, idx, isLast }) {
  const { palette: C } = useTheme();
  const [ref, visible] = useInView();
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -24 }}
      animate={visible ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: idx * 0.09 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={[
        "grid grid-cols-1 gap-3 px-5 py-6 md:grid-cols-[auto_minmax(0,0.9fr)_minmax(0,1.45fr)_minmax(0,1fr)] md:items-center md:gap-6 md:px-8 md:py-7",
        !isLast && "border-b border-white/[0.05]",
        hovered && "bg-white/[0.04]",
        "transition-[background-color] duration-200",
      ].filter(Boolean).join(" ")}
    >
      <span
        className="hidden md:inline-flex"
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.12em",
          color: hovered ? "white" : "rgba(255,255,255,0.35)",
          width: 28,
          height: 28,
          borderRadius: 8,
          border: `1px solid ${hovered ? `${C.coral}55` : "rgba(255,255,255,0.12)"}`,
          background: hovered ? `${C.coral}18` : "rgba(255,255,255,0.04)",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.25s ease",
        }}
        aria-hidden
      >
        {String(idx + 1).padStart(2, "0")}
      </span>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: hovered ? C.coral : `${C.coral}cc`,
        fontWeight: 600,
        transition: "color 0.25s ease",
      }}>
        {e.label}
      </span>
      <span style={{
        fontFamily: BODY_FONT_STACK,
        fontSize: "clamp(1rem, 2vw, 1.2rem)",
        fontWeight: 600,
        color: "white",
        fontStyle: "normal",
        textShadow: hovered ? `0 0 24px ${C.violet}55` : "none",
        transition: "text-shadow 0.3s ease",
      }}>
        {e.name}
      </span>
      <span
        className="text-left md:text-right"
        style={{
          fontSize: 13,
          color: C.muted,
          fontFamily: BODY_FONT_STACK,
          lineHeight: 1.7,
        }}
      >
        {e.detail}
      </span>
    </motion.div>
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
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          radial-gradient(ellipse 85% 65% at 28% 45%, ${C.coral}12 0%, transparent 52%),
          radial-gradient(ellipse 75% 60% at 78% 52%, ${C.violet}10 0%, transparent 55%)
        `,
        pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
        style={{ position: "relative", zIndex: 2, maxWidth: 720, margin: "0 auto" }}
      >
        <SectionLabel>Begin</SectionLabel>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2rem, 4.4vw, 2.85rem)",
          fontWeight: 600,
          color: "white",
          lineHeight: 1.18,
          letterSpacing: "-0.02em",
          margin: "0 auto 24px",
          maxWidth: 720,
        }}>
          Walk into the next round{" "}
          <span style={{ fontStyle: "italic", color: C.coral }}>
            already calibrated.
          </span>
        </h2>
        <p style={{
          fontFamily: BODY_FONT_STACK,
          fontSize: 15.5,
          color: C.muted,
          lineHeight: 1.75,
          maxWidth: 520,
          margin: "0 auto 40px",
        }}>
          One session takes about twelve minutes. The signal compounds.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <CtaButton to={user ? "/interview/new" : "/register"}>
            {user ? "Start new interview" : "Create free account"}
          </CtaButton>
          <GhostButton to="/pricing">View pricing</GhostButton>
        </div>

        <p style={{
          marginTop: 28,
          fontFamily: BODY_FONT_STACK,
          fontSize: 12.5,
          color: C.marqueeText,
        }}>
          Free plan, no card, cancel any time.
        </p>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
          }}
          aria-label="Trust signals"
        >
          {["No credit card", "GDPR-minded", "Delete anytime", "12-min sessions"].map((badge) => (
            <span
              key={badge}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                borderRadius: 999,
                border: `1px solid rgba(255,255,255,0.12)`,
                background: "rgba(255,255,255,0.06)",
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.muted,
              }}
            >
              <span style={{ color: C.coral, fontSize: 8 }} aria-hidden>●</span>
              {badge}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}