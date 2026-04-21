import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, useReducedMotion } from "framer-motion";
import SiteFooter from "../components/SiteFooter";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import ComparisonSection from "../components/landing/ComparisonSection";
import PersonasSection from "../components/landing/PersonasSection";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import PricingTeaserSection from "../components/landing/PricingTeaserSection";
import SecuritySection from "../components/landing/SecuritySection";
import FAQSection from "../components/landing/FAQSection";
import FounderLetterSection from "../components/landing/FounderLetterSection";
import LandingHero from "../components/landing/LandingHero";

/* ─── DATA ───────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    num: "01",
    icon: "◈",
    title: "Resume-aware AI",
    body: "Gemini analyzes your PDF and job description to generate hyper-specific technical questions — not boilerplate.",
    accent: "#ff5c3a",
  },
  {
    num: "02",
    icon: "◉",
    title: "Real-time eye tracking",
    body: "MediaPipe maps gaze at 30 fps so you build consistent camera contact under pressure.",
    accent: "#7c3aed",
  },
  {
    num: "03",
    icon: "◆",
    title: "Live speech analytics",
    body: "Browser-native transcription flags filler words and measures words per minute instantly.",
    accent: "#ff5c3a",
  },
  {
    num: "04",
    icon: "◎",
    title: "Actionable scorecards",
    body: "Deterministic 0–10 scores plus structured feedback you can rehearse against.",
    accent: "#7c3aed",
  },
  {
    num: "05",
    icon: "⎈",
    title: "Adaptive follow-ups",
    body: "When your answer has room to go deeper, Gemini may insert one sharp follow-up per primary question—probing metrics, ownership, or tradeoffs like a real loop.",
    accent: "#ff5c3a",
  },
];

const ENGINES = [
  { label: "Cognitive engine", name: "Gemini 1.5 Flash", detail: "Context-aware questions & deterministic JSON grading" },
  { label: "Spatial tracking", name: "MediaPipe Vision", detail: "468 facial landmarks at 30 fps for gaze estimation" },
  { label: "Neural transcription", name: "Web Speech API", detail: "Browser-native STT with minimal latency" },
  { label: "Behavioral analytics", name: "Local NLP heuristics", detail: "WPM & filler detection — no round-trips to server" },
];

const TRUST_MARKS = ["IIT", "NIT", "SPPU", "VIT", "BITS", "IIIT"];

const STATS = [
  { value: "94%", label: "report more confidence after 3 sessions" },
  { value: "2.4×", label: "faster offer rate vs. uncoached peers" },
  { value: "<80ms", label: "real-time feedback latency" },
  { value: "10k+", label: "interviews analyzed" },
];

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
  return (
    <div aria-hidden style={{
      position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      opacity: 0.028,
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
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color: C.coral,
      border: `1px solid ${C.coral}33`,
      borderRadius: 999,
      padding: "5px 16px",
      marginBottom: 28,
      background: `${C.coral}14`,
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
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
            fontWeight: 700,
            color: C.marqueeText,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontStyle: "italic",
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
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay }}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        padding: "32px 28px",
        textAlign: "center",
        boxShadow: C.cardShadow,
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2rem, 4vw, 3rem)",
          fontWeight: 900,
          lineHeight: 1.1,
          marginBottom: 8,
          ...gradientTextStyle(C.coral, C.violet),
        }}
      >
        {value}
      </div>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, fontFamily: "'Lora', serif" }}>{label}</p>
    </motion.div>
  );
}

/* ─── FEATURE CARD ───────────────────────────────────────────────────── */
function FeatureCard({ f, idx }) {
  const { palette: C } = useTheme();
  const [ref, visible] = useInView();
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: idx * 0.1 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 24,
        padding: "40px 36px",
        background: C.card,
        border: `1px solid ${hovered ? f.accent + "44" : C.border}`,
        boxShadow: hovered ? `0 20px 60px ${f.accent}18` : C.cardShadow,
        transition: "all 0.35s ease",
        cursor: "default",
      }}
    >
      {/* glow */}
      <div style={{
        position: "absolute", top: -40, right: -40, width: 180, height: 180,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${f.accent}22, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: "none",
      }} />
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 11,
        fontWeight: 700,
        color: f.accent,
        letterSpacing: "0.2em",
        marginBottom: 20,
        opacity: 0.8,
      }}>{f.num} ──</div>
      <div style={{
        fontSize: 32,
        marginBottom: 16,
        filter: `drop-shadow(0 2px 8px ${f.accent}33)`,
      }}>{f.icon}</div>
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 22,
        fontWeight: 700,
        color: C.ink,
        marginBottom: 12,
        lineHeight: 1.25,
      }}>{f.title}</h3>
      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, fontFamily: "'Lora', serif" }}>{f.body}</p>
    </motion.div>
  );
}

/* ─── CTA BUTTON ─────────────────────────────────────────────────────── */
function CtaButton({ to, children }) {
  const { palette: C } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <motion.span
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileTap={{ scale: 0.97 }}
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
          boxShadow: hovered
            ? `0 20px 60px ${C.coral}55, 0 0 0 1px ${C.coral}33`
            : `0 8px 32px ${C.coral}33`,
          transition: "all 0.3s ease",
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
    <Link to={to} style={{ textDecoration: "none" }}>
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

/* ─── DIVIDER ────────────────────────────────────────────────────────── */
function Divider() {
  const { palette: C } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "0 0 0 0", opacity: 0.35 }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${C.dividerLine})` }} />
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.4em", color: C.muted, textTransform: "uppercase" }}>✦</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${C.dividerLine})` }} />
    </div>
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
      link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Mono:wght@400;500;600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }));
  }, [location.hash, reduceMotion]);

  return (
    <div style={{ background: C.paper, color: C.ink, overflowX: "hidden", minHeight: "100vh" }}>
      <Grain />

      {/* ── HERO (original component preserved) ── */}
      <LandingHero user={user} />

      {/* ── TRUST STRIP ── */}
      <section
        aria-label="Trusted by"
        style={{
          padding: "72px 24px 80px",
          background: C.paper,
          position: "relative",
        }}
      >
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          borderRadius: 28,
          border: `1px solid ${C.border}`,
          background: C.card,
          boxShadow: C.cardShadow,
          padding: "40px 20px 36px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div aria-hidden style={{
            position: "absolute", top: 0, left: "12%", right: "12%", height: 1,
            background: `linear-gradient(90deg, transparent, ${C.coral}40, ${C.violet}40, transparent)`,
            opacity: 0.9,
          }} />
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.38em",
              textTransform: "uppercase",
              color: C.coral,
            }}>
              Social proof
            </span>
          </div>
          <div style={{ textAlign: "center", marginBottom: 26 }}>
            <p style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(1.35rem, 3vw, 1.75rem)",
              fontWeight: 700,
              fontStyle: "italic",
              color: C.ink,
              letterSpacing: "-0.02em",
              margin: 0,
            }}>
              Trusted on campuses where interviews are a sport
            </p>
            <p style={{
              margin: "12px auto 0",
              fontFamily: "'Lora', serif",
              fontSize: 14,
              color: C.muted,
              maxWidth: 420,
              lineHeight: 1.6,
            }}>
              Students and new grads use InterviewAI to rehearse with the same rigor as the real loop.
            </p>
          </div>
          <Marquee items={TRUST_MARKS} speed={42} />
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px 24px 96px",
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
            fontFamily: "'Lora', serif",
            fontSize: 15,
            color: C.muted,
            maxWidth: 520,
            margin: "0 auto",
            lineHeight: 1.65,
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
      <HowItWorksSection />

      {/* ── CORE ARCHITECTURE ── */}
      <section
        id="core-architecture"
        style={{
          padding: "120px 24px",
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
            <SectionLabel>Core architecture</SectionLabel>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.2rem, 5vw, 3.75rem)",
              fontWeight: 900,
              color: "white",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: 20,
            }}>
              Four specialized engines.<br />
              <span style={gradientTextStyle(C.coral, C.violet, { angle: "90deg", fontStyle: "italic" })}>
                One seamless verdict.
              </span>
            </h2>
            <p style={{ fontFamily: "'Lora', serif", fontSize: 17, color: "#9ca3af", maxWidth: 520, lineHeight: 1.7 }}>
              Every millisecond of your session passes through a purpose-built pipeline — no black boxes, no guesswork.
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
            {/* header row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 2fr 1fr",
              gap: 24,
              padding: "16px 32px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}>
              {["Layer", "Engine", "Responsibility"].map(h => (
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
              <EngineRowDark key={e.label} e={e} idx={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 24px" }}>
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
          <p style={{ fontFamily: "'Lora', serif", fontSize: 17, color: C.muted, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
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

      <Divider />

      {/* ── COMPARISON (original) ── */}
      <ComparisonSection />

      {/* ── FOUNDER LETTER (original) ── */}
      <FounderLetterSection />

      {/* ── PERSONAS (original) ── */}
      <PersonasSection />

      {/* ── TESTIMONIALS (original) ── */}
      <TestimonialsSection />

      {/* ── PRICING (original) ── */}
      <PricingTeaserSection />

      {/* ── SECURITY (original) ── */}
      <SecuritySection />

      {/* ── FAQ (original) ── */}
      <FAQSection limit={4} />

      {/* ── FINAL CTA ── */}
      <FinalCta user={user} />

      <SiteFooter />
    </div>
  );
}

/* ─── ENGINE ROW DARK (inside dark section) ───────────────────────────── */
function EngineRowDark({ e, idx }) {
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
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        alignItems: "center",
        gap: 24,
        padding: "28px 32px",
        borderBottom: idx < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
        background: hovered ? "rgba(255,255,255,0.04)" : "transparent",
        transition: "background 0.25s ease",
      }}
    >
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
        color: C.coral,
        fontWeight: 600,
      }}>
        {e.label}
      </span>
      <span style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(1rem, 2vw, 1.375rem)",
        fontWeight: 700,
        color: "white",
        fontStyle: "italic",
      }}>
        {e.name}
      </span>
      <span style={{
        fontSize: 13,
        color: "#6b7280",
        textAlign: "right",
        fontFamily: "'Lora', serif",
        lineHeight: 1.5,
      }}>
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
        padding: "160px 24px 150px",
        background: C.band,
        textAlign: "center",
      }}
    >
      {/* bg mesh */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          radial-gradient(ellipse 85% 65% at 28% 45%, ${C.coral}18 0%, transparent 52%),
          radial-gradient(ellipse 75% 60% at 78% 52%, ${C.violet}16 0%, transparent 55%),
          radial-gradient(ellipse 50% 40% at 50% 100%, rgba(255,255,255,0.04) 0%, transparent 45%)
        `,
        pointerEvents: "none",
      }} />
      {/* grid lines */}
      <div aria-hidden style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "80px 80px",
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
          fontSize: "clamp(2.65rem, 6.5vw, 4.75rem)",
          fontWeight: 900,
          color: "white",
          lineHeight: 1.02,
          letterSpacing: "-0.035em",
          marginBottom: 28,
        }}>
          Ship the version of you<br />
          <span style={{ fontStyle: "italic", ...gradientTextStyle(C.coral, C.violet) }}>
            who closes the loop
          </span>
        </h2>
        <p style={{
          fontFamily: "'Lora', serif",
          fontSize: 18,
          color: "#9ca3af",
          lineHeight: 1.75,
          marginBottom: 48,
          maxWidth: 520,
          margin: "0 auto 52px",
        }}>
          Every session produces structured signal: where you looked, how you paced, what you said — and what to fix next. No vibes, no vague “be confident.”
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <CtaButton to={user ? "/interview/new" : "/register"}>
            {user ? "Start new interview" : "Create free account"}
          </CtaButton>
          <GhostButton to="/pricing">View pricing</GhostButton>
        </div>

        {/* trust line */}
        <p style={{
          marginTop: 40,
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: "rgba(255,255,255,0.2)",
          textTransform: "uppercase",
        }}>
          No credit card required · Free plan always available
        </p>
      </motion.div>
    </section>
  );
}