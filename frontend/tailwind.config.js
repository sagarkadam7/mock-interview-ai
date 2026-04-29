/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        aura: {
          page: "var(--aura-page)",
          "page-deep": "var(--aura-page-deep)",
          ink: "var(--aura-ink)",
          card: "var(--aura-card)",
          line: "var(--aura-line)",
          coral: "#F43F5E",
          violet: "#4F46E5",
          muted: "var(--aura-muted)",
          cta: "var(--aura-cta)",
          frame: "var(--aura-frame)",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        display: ['"Playfair Display"', "Georgia", "ui-serif", "serif"],
        brand: ['"Sora"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        data: ['"DM Sans"', "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: [
          '"DM Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      letterSpacing: {
        aura: "0.28em",
      },
      boxShadow: {
        glass: "0 1px 0 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -8px rgba(15,23,42,0.08)",
        enterprise: "0 1px 2px rgba(15,23,42,0.06), 0 8px 28px -6px rgba(15,23,42,0.1)",
        lux: "0 1px 0 0 rgba(255,255,255,0.88) inset, 0 1px 2px rgba(15,23,42,0.04), 0 24px 48px -16px rgba(15,23,42,0.09)",
        "lux-lg":
          "0 1px 0 0 rgba(255,255,255,0.92) inset, 0 4px 12px rgba(15,23,42,0.04), 0 32px 64px -20px rgba(15,23,42,0.12), 0 0 0 1px rgba(15,23,42,0.04)",
        "lux-nav": "0 8px 32px -8px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.04)",
        "glow-coral": "0 0 40px -6px rgba(244,63,94, 0.22)",
        "glow-violet": "0 0 40px -6px rgba(79,70,229, 0.22)",
      },
      backgroundImage: {
        "gradient-cta": "linear-gradient(135deg, #F43F5E 0%, #6366F1 52%, #4F46E5 100%)",
        "gradient-progress": "linear-gradient(90deg, #F43F5E, #4F46E5)",
        "aura-dots":
          "radial-gradient(rgba(15,23,42,0.07) 1px, transparent 1px)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring-soft": "cubic-bezier(0.34, 1.3, 0.64, 1)",
      },
      transitionDuration: {
        250: "250ms",
        350: "350ms",
        450: "450ms",
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(-12px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "hero-breathe": {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.55", transform: "scale(1.04)" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) both",
        "hero-breathe": "hero-breathe 14s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

