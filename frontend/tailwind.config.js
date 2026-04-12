/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        aura: {
          page: "#f4f4f7",
          "page-deep": "#ececf0",
          ink: "#0f172a",
          card: "#ffffff",
          line: "#e4e4e9",
          coral: "#FF7E5F",
          violet: "#9D50BB",
          muted: "#64748b",
          cta: "#121217",
          frame: "rgba(15, 23, 42, 0.06)",
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
      },
      letterSpacing: {
        aura: "0.28em",
      },
      boxShadow: {
        glass: "0 1px 0 0 rgba(255,255,255,0.9) inset, 0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -8px rgba(15,23,42,0.08)",
        enterprise: "0 1px 2px rgba(15,23,42,0.06), 0 8px 28px -6px rgba(15,23,42,0.1)",
        "glow-coral": "0 0 40px -6px rgba(255, 126, 95, 0.25)",
        "glow-violet": "0 0 40px -6px rgba(157, 80, 187, 0.22)",
      },
      backgroundImage: {
        "gradient-cta": "linear-gradient(135deg, #FF7E5F 0%, #9D50BB 100%)",
        "gradient-progress": "linear-gradient(90deg, #FF7E5F, #9D50BB)",
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
      },
      animation: {
        "toast-in": "toast-in 0.42s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
