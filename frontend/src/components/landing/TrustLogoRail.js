import React from "react";

/**
 * Premium grayscale enterprise logo rail.
 * Uses inline SVG wordmarks so no network/CDN dependency.
 * Hover lifts each logo to full saturation/opacity for a polished B2B feel.
 */

// Logos expressed as compact inline SVGs. Each is monochrome currentColor so
// the grayscale + hover color transition works uniformly.
const LOGOS = [
  {
    name: "IIT",
    svg: (
      <svg viewBox="0 0 120 40" className="h-8 w-auto" role="img" aria-label="IIT" fill="currentColor">
        <text x="60" y="28" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="800" fontSize="22" letterSpacing="4">IIT</text>
      </svg>
    ),
  },
  {
    name: "NIT",
    svg: (
      <svg viewBox="0 0 120 40" className="h-8 w-auto" role="img" aria-label="NIT" fill="currentColor">
        <text x="60" y="28" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="800" fontSize="22" letterSpacing="4">NIT</text>
      </svg>
    ),
  },
  {
    name: "SPPU",
    svg: (
      <svg viewBox="0 0 140 40" className="h-8 w-auto" role="img" aria-label="SPPU" fill="currentColor">
        <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="80" y="27" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="18" letterSpacing="3">SPPU</text>
      </svg>
    ),
  },
  {
    name: "VIT",
    svg: (
      <svg viewBox="0 0 120 40" className="h-8 w-auto" role="img" aria-label="VIT" fill="currentColor">
        <path d="M8 10 L18 30 L28 10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="78" y="28" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="20" letterSpacing="3">VIT</text>
      </svg>
    ),
  },
  {
    name: "BITS",
    svg: (
      <svg viewBox="0 0 140 40" className="h-8 w-auto" role="img" aria-label="BITS" fill="currentColor">
        <rect x="6" y="10" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <text x="82" y="27" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="18" letterSpacing="3">BITS</text>
      </svg>
    ),
  },
  {
    name: "IIIT",
    svg: (
      <svg viewBox="0 0 130 40" className="h-8 w-auto" role="img" aria-label="IIIT" fill="currentColor">
        <text x="65" y="28" textAnchor="middle" fontFamily="'Playfair Display', serif" fontWeight="800" fontSize="22" letterSpacing="4">IIIT</text>
      </svg>
    ),
  },
];

export default function TrustLogoRail() {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14"
      role="list"
      aria-label="Trusted on campuses"
    >
      {LOGOS.map((logo) => (
        <div
          key={logo.name}
          role="listitem"
          className="text-slate-500 opacity-50 grayscale transition-all duration-300 ease-out hover:opacity-100 hover:grayscale-0 hover:text-aura-ink dark:text-slate-400 dark:hover:text-white"
          title={logo.name}
        >
          {logo.svg}
        </div>
      ))}
    </div>
  );
}
