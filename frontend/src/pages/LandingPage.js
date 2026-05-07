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
    title: "Resume-aware AI",
    body: "Gemini analyzes your PDF and job description to generate hyper-specific technical questions — not boilerplate.",
    accent: "#e85547",
  },
  {
    num: "02",
    title: "Real-time eye tracking",
    body: "MediaPipe maps gaze at 30 fps so you build consistent camera contact under pressure.",
    accent: "#5b21b6",
  },
  {
    num: "03",
    title: "Live speech analytics",
    body: "Browser-native transcription flags filler words and measures words per minute instantly.",
    accent: "#e85547",
  },
  {
    num: "04",
    title: "Actionable scorecards",
    body: "Deterministic 0–10 scores plus structured feedback you can rehearse against.",
    accent: "#5b21b6",
  },
  {
    num: "05",
    title: "Adaptive follow-ups",
    body: "When your answer has room to go deeper, Gemini may insert one sharp follow-up per primary question—probing metrics, ownership, or tradeoffs like a real loop.",
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
  { value: "94%", label: "report more confidence after 3 sessions" },
  { value: "2.4×", label: "faster offer rate vs. uncoached peers" },
  { value: "<80ms", label: "real-time feedback latency" },
  { value: "10k+", label: "interviews analyzed" },
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

/* ─── SECTION LABEL ──────────────────────────────────────────────────── */
function SectionLabel({ children }) {
  const { palette: C } = useTheme();
  return (
    <span style={{
      display: "inline-block",
      fontFamily: "'DM Mono', monospace",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: C.muted,
      marginBottom: 20,
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
function StatCard({ value, label, delay = 0 }) {
  const { palette: C } = useTheme();
  const [ref, visible] = useInView();
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card,
        border: `1px solid ${hovered ? `${C.violet}33` : C.border}`,
        borderRadius: 20,
        padding: "32px 28px",
        textAlign: "center",
        boxShadow: hovered ? `0 18px 48px -16px ${C.violet}26, 0 1px 0 0 rgba(255,255,255,0.06) inset` : C.cardShadow,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.28s cubic-bezier(0.16,1,0.3,1), box-shadow 0.28s ease, border-color 0.28s ease",
      }}
    >
      <div
        style={{
          fontFamily: BODY_FONT_STACK,
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: 8,
          ...gradientTextStyle(C.coral, C.violet),
        }}
      >
        {value}
      </div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, fontFamily: BODY_FONT_STACK }}>{label}</p>
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
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
        cursor: "default",
      }}
    >
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
        whileTap={{ scale: 0.97 }}
        animate={
          hovered
            ? { boxShadow: `0 20px 60px ${C.coral}55, 0 0 0 1px ${C.coral}33` }
            : {
                boxShadow: [
                  `0 8px 32px ${C.coral}26`,
                  `0 12px 40px ${C.coral}3d`,
                  `0 8px 32px ${C.coral}26`,
                ],
              }
        }
        transition={
          hovered
            ? { duration: 0.3 }
            : { duration: 2.6, ease: "easeInOut", repeat: Infinity }
        }
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "16px 36px",
          borderRadius: 999,
          background: hovered
            ? `linear-gradient(135deg, ${C.violet}, ${C.coral})`
            : `linear-gradient(135deg, ${C.coral}, ${C.violet})`,
          color: "white",
          fontFamily: "'DM Mono', monospace",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
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
        gap: 8,
        padding: "15px 32px",
        borderRadius: 999,
        border: `1.5px solid ${hovered ? C.ink : C.border}`,
        color: hovered ? C.ink : C.muted,
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
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
          background: C.paper,
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="w-full min-w-0">
            <TrustLogoRail />
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "56px 24px 72px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel>Outcomes</SectionLabel>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 800,
            color: C.ink,
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
            lineHeight: 1.15,
          }}>
            Numbers that match how you <span style={{ fontStyle: "italic", ...gradientTextStyle(C.coral, C.violet) }}>actually feel</span> after reps
          </h2>
          <p style={{
            fontFamily: BODY_FONT_STACK,
            fontSize: 15,
            color: C.muted,
            maxWidth: 520,
            margin: "0 auto",
            lineHeight: 1.75,
          }}>
            Confidence compounds when feedback is specific, fast, and tied to your materials — not a random quiz.
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 22,
        }}>
          {STATS.map((s, i) => <StatCard key={s.value} {...s} delay={i * 0.08} />)}
        </div>
      </section>

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

        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ marginBottom: 72 }}>
            <SectionLabel>Outcome engine</SectionLabel>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
              fontWeight: 900,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}>
              Practice loops built for<br />
              <span style={gradientTextStyle(C.coral, C.violet, { angle: "90deg", fontStyle: "italic" })}>
                measurable interview wins.
              </span>
            </h2>
            <p style={{ fontFamily: BODY_FONT_STACK, fontSize: 17, color: C.muted, maxWidth: 620, lineHeight: 1.8 }}>
              InterviewAI turns each session into immediate coaching signals so you improve clarity, confidence, and executive presence in one pass.
            </p>
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
                gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.45fr) minmax(0, 1fr)",
                gap: 24,
              }}
            >
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
      <section id="features" style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px", scrollMarginTop: "5.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <SectionLabel>What's inside</SectionLabel>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 900,
            color: C.ink,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 20,
          }}>
            Everything to{" "}
            <span style={{ fontStyle: "italic", ...gradientTextStyle(C.coral, C.violet) }}>
              land the offer
            </span>
          </h2>
          <p style={{ fontFamily: BODY_FONT_STACK, fontSize: 17, color: C.muted, maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>
            No generic question banks. Every question is grounded in your story.
          </p>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24,
        }}>
          {FEATURES.map((f, i) => <FeatureCard key={f.num} f={f} idx={i} />)}
        </div>
      </section>

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
        "grid grid-cols-1 gap-3 px-5 py-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.45fr)_minmax(0,1fr)] md:items-center md:gap-6 md:px-8 md:py-7",
        !isLast && "border-b border-white/[0.05]",
        hovered && "bg-white/[0.04]",
        "transition-[background-color] duration-200",
      ].filter(Boolean).join(" ")}
    >
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
        <SectionLabel>Get started</SectionLabel>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2.15rem, 5.5vw, 3.35rem)",
          fontWeight: 900,
          color: "white",
          lineHeight: 1.08,
          letterSpacing: "-0.03em",
          marginBottom: 22,
        }}>
          Ship the version of you<br />
          <span style={{ fontStyle: "italic", ...gradientTextStyle(C.coral, C.violet) }}>
            who closes the loop
          </span>
        </h2>
        <p style={{
          fontFamily: BODY_FONT_STACK,
          fontSize: 16,
          color: C.muted,
          lineHeight: 1.75,
          maxWidth: 480,
          margin: "0 auto 40px",
        }}>
          Each session turns gaze, pace, and wording into clear next steps—so practice compounds instead of resetting.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <CtaButton to={user ? "/interview/new" : "/register"}>
            {user ? "Start new interview" : "Create free account"}
          </CtaButton>
          <GhostButton to="/pricing">View pricing</GhostButton>
        </div>

        <p style={{
          marginTop: 32,
          fontFamily: BODY_FONT_STACK,
          fontSize: 13,
          color: C.marqueeText,
        }}>
          Free plan available — no credit card, cancel any time. Your first session takes ~12 minutes.
        </p>
      </motion.div>
    </section>
  );
}