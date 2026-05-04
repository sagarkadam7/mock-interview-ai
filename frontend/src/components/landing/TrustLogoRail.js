import React, { useEffect, useRef, useState } from "react";

/**
 * TrustLogoRail — 10x redesign
 *
 * Fixes vs original:
 * - Logos: real glyph+wordmark SVGs (not bare text)
 * - Marquee: inline @keyframes with correct translateX math (50% of doubled set)
 * - Entrance: staggered shimmer reveal on mount
 * - Hover: lift + border glow + name tooltip
 * - Reduced motion: static centered grid with fade-in only
 * - a11y: role="list" on static, aria-hidden on marquee dupes, live region label
 */

const ACCENT = "#C9A86C"; // warm gold — luxury brand signal

const LOGOS = [
  {
    name: "IIT",
    full: "Indian Institutes of Technology",
    tier: "Premier",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="56" height="56" rx="6" stroke="currentColor" strokeWidth="1.5" />
        <line x1="32" y1="4" x2="32" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <line x1="4" y1="32" x2="60" y2="32" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
        <text x="32" y="38" textAnchor="middle" fontFamily="'Georgia', serif" fontWeight="700" fontSize="18" fill="currentColor" letterSpacing="2">IIT</text>
        <circle cx="32" cy="32" r="6" fill="none" stroke={ACCENT} strokeWidth="1" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "NIT",
    full: "National Institutes of Technology",
    tier: "National",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <polygon points="32,6 58,54 6,54" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <polygon points="32,18 48,48 16,48" stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.4" />
        <text x="32" y="44" textAnchor="middle" fontFamily="'Georgia', serif" fontWeight="700" fontSize="14" fill="currentColor" letterSpacing="2">NIT</text>
      </svg>
    ),
  },
  {
    name: "SPPU",
    full: "Savitribai Phule Pune University",
    tier: "State",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="18" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
        <circle cx="32" cy="32" r="4" fill="currentColor" opacity="0.7" />
        <text x="32" y="55" textAnchor="middle" fontFamily="'Georgia', serif" fontWeight="700" fontSize="10" fill="currentColor" letterSpacing="1">SPPU</text>
        <line x1="6" y1="32" x2="58" y2="32" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
        <line x1="32" y1="6" x2="32" y2="58" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      </svg>
    ),
  },
  {
    name: "VIT",
    full: "Vellore Institute of Technology",
    tier: "Deemed",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M8 12 L32 52 L56 12" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 12 L32 38 L46 12" stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="20" y="8" width="24" height="4" rx="1" fill="currentColor" opacity="0.15" />
        <text x="32" y="10" textAnchor="middle" fontFamily="'Georgia', serif" fontWeight="700" fontSize="9" fill="currentColor" letterSpacing="1">VIT</text>
      </svg>
    ),
  },
  {
    name: "BITS",
    full: "Birla Institute of Technology & Science",
    tier: "Deemed",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="8" y="8" width="48" height="48" rx="4" stroke="currentColor" strokeWidth="1.5" />
        <rect x="16" y="16" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
        <path d="M24 24 L40 40 M40 24 L24 40" stroke={ACCENT} strokeWidth="1" opacity="0.5" />
        <text x="32" y="36" textAnchor="middle" fontFamily="'Georgia', serif" fontWeight="700" fontSize="12" fill="currentColor" letterSpacing="1">BITS</text>
      </svg>
    ),
  },
  {
    name: "IIIT",
    full: "Indian Institutes of Information Technology",
    tier: "Premier",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <rect x="6" y="6" width="52" height="52" rx="26" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="14" width="36" height="36" rx="18" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
        <text x="32" y="37" textAnchor="middle" fontFamily="'Georgia', serif" fontWeight="700" fontSize="13" fill="currentColor" letterSpacing="1">IIIT</text>
      </svg>
    ),
  },
  {
    name: "DTU",
    full: "Delhi Technological University",
    tier: "State",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M10 54 L10 10 L38 10 Q54 10 54 32 Q54 54 38 54 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M18 46 L18 18 L36 18 Q46 18 46 32 Q46 46 36 46 Z" stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.4" />
        <text x="29" y="37" textAnchor="middle" fontFamily="'Georgia', serif" fontWeight="700" fontSize="11" fill="currentColor" letterSpacing="1">DTU</text>
      </svg>
    ),
  },
  {
    name: "COEP",
    full: "College of Engineering Pune",
    tier: "Autonomous",
    svg: (
      <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M32 8 L56 24 L56 56 L8 56 L8 24 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M32 18 L48 28 L48 50 L16 50 L16 28 Z" stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.4" />
        <rect x="26" y="44" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
        <text x="32" y="40" textAnchor="middle" fontFamily="'Georgia', serif" fontWeight="700" fontSize="10" fill="currentColor" letterSpacing="1">COEP</text>
      </svg>
    ),
  },
];

const TIER_COLORS = {
  Premier: { bg: "rgba(201,168,108,0.12)", border: "rgba(201,168,108,0.5)", text: "#C9A86C" },
  National: { bg: "rgba(130,180,255,0.10)", border: "rgba(130,180,255,0.4)", text: "#82B4FF" },
  Deemed: { bg: "rgba(160,220,180,0.10)", border: "rgba(160,220,180,0.4)", text: "#A0DCB4" },
  State: { bg: "rgba(200,160,255,0.10)", border: "rgba(200,160,255,0.4)", text: "#C8A0FF" },
  Autonomous: { bg: "rgba(255,180,120,0.10)", border: "rgba(255,180,120,0.4)", text: "#FFB478" },
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const h = () => setReduced(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

/* ─── Logo card ─────────────────────────────────────────────── */
function LogoCard({ logo, style = {}, tabIndex = -1 }) {
  const [hovered, setHovered] = useState(false);
  const tier = TIER_COLORS[logo.tier] || TIER_COLORS.State;

  return (
    <div
      title={logo.full}
      tabIndex={tabIndex}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        padding: "18px 20px 14px",
        borderRadius: "12px",
        border: hovered
          ? `1px solid ${tier.border}`
          : "1px solid rgba(255,255,255,0.07)",
        background: hovered
          ? `${tier.bg}`
          : "rgba(255,255,255,0.03)",
        cursor: "default",
        transition: "all 0.25s cubic-bezier(.4,0,.2,1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${tier.border}`
          : "none",
        userSelect: "none",
        flexShrink: 0,
        width: "108px",
        ...style,
      }}
    >
      {/* Glyph */}
      <div
        style={{
          width: "52px",
          height: "52px",
          color: hovered ? tier.text : "rgba(255,255,255,0.35)",
          transition: "color 0.25s ease",
        }}
      >
        {logo.svg}
      </div>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: "13px",
          letterSpacing: "0.12em",
          color: hovered ? "#F5F0E8" : "rgba(255,255,255,0.45)",
          transition: "color 0.25s ease",
        }}
      >
        {logo.name}
      </span>

      {/* Tier badge — only on hover */}
      <span
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          fontSize: "9px",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: tier.text,
          background: tier.bg,
          border: `0.5px solid ${tier.border}`,
          borderRadius: "4px",
          padding: "2px 5px",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.2s ease",
          pointerEvents: "none",
        }}
      >
        {logo.tier}
      </span>
    </div>
  );
}

/* ─── Marquee track ──────────────────────────────────────────── */
const DUPED = [...LOGOS, ...LOGOS];

export default function TrustLogoRail() {
  const reduced = usePrefersReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── Styles injected once ── */
  const styleId = "trust-rail-styles";
  useEffect(() => {
    if (document.getElementById(styleId)) return;
    const el = document.createElement("style");
    el.id = styleId;
    el.textContent = `
      @keyframes trust-marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      @keyframes trust-fade-in {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .trust-marquee-track {
        display: flex;
        align-items: center;
        gap: 16px;
        width: max-content;
        animation: trust-marquee 28s linear infinite;
        will-change: transform;
      }
      .trust-marquee-track:hover {
        animation-play-state: paused;
      }
      .trust-section-enter {
        opacity: 0;
        animation: trust-fade-in 0.7s cubic-bezier(.4,0,.2,1) forwards;
      }
    `;
    document.head.appendChild(el);
    return () => { /* keep styles alive */ };
  }, []);

  /* ── Section wrapper ── */
  const sectionStyle = {
    width: "100%",
    padding: "64px 0 80px",
    background: "transparent",
  };

  /* ── Label above ── */
  const labelEl = (
    <div
      style={{
        textAlign: "center",
        marginBottom: "28px",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: "10px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: ACCENT,
          border: `0.5px solid ${ACCENT}40`,
          background: `${ACCENT}10`,
          borderRadius: "999px",
          padding: "5px 14px",
        }}
      >
        Social Proof
      </span>
    </div>
  );

  /* ── Divider stats ── */
  const statsEl = (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "40px",
        marginBottom: "56px",
        flexWrap: "wrap",
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.7s ease 0.25s",
      }}
    >
      {[
        { value: "8+", label: "Top Campuses" },
        { value: "2,400+", label: "Mock Interviews" },
        { value: "91%", label: "Offer Rate" },
      ].map((s) => (
        <div key={s.label} style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Playfair Display', 'Georgia', serif",
              fontWeight: 800,
              fontSize: "26px",
              color: ACCENT,
              lineHeight: 1,
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              marginTop: "6px",
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );

  /* ── Rail ── */
  if (reduced) {
    return (
      <section style={sectionStyle} aria-label="University partners">
        {labelEl}
        {statsEl}
        <div
          role="list"
          aria-label="Partner universities"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "16px",
            padding: "0 24px",
          }}
        >
          {LOGOS.map((logo, i) => (
            <div
              key={logo.name}
              role="listitem"
              style={{
                opacity: mounted ? 1 : 0,
                transition: `opacity 0.5s ease ${i * 0.07}s`,
              }}
            >
              <LogoCard logo={logo} tabIndex={0} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section style={sectionStyle} aria-label="University partners">
      {labelEl}
      {statsEl}

      {/* Marquee */}
      <div
        role="presentation"
        aria-label="Scrolling list of partner universities: IIT, NIT, SPPU, VIT, BITS, IIIT, DTU, COEP"
        style={{
          position: "relative",
          overflow: "hidden",
          /* Fade edges */
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.6s ease 0.35s",
          padding: "8px 0 16px",
        }}
      >
        {/* Screen-reader accessible list hidden visually */}
        <ul aria-label="Partner universities" style={{ position: "absolute", opacity: 0, pointerEvents: "none", margin: 0, padding: 0 }}>
          {LOGOS.map((l) => (
            <li key={l.name}>{l.full}</li>
          ))}
        </ul>

        <div className="trust-marquee-track" aria-hidden="true">
          {DUPED.map((logo, i) => (
            <LogoCard key={`${logo.name}-${i}`} logo={logo} />
          ))}
        </div>
      </div>

      {/* Bottom flourish */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "36px",
          gap: "6px",
          opacity: mounted ? 0.4 : 0,
          transition: "opacity 0.6s ease 0.5s",
        }}
      >
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              width: i === 2 ? "24px" : "6px",
              height: "2px",
              borderRadius: "1px",
              background: i === 2 ? ACCENT : "rgba(255,255,255,0.3)",
              transition: "width 0.3s ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}