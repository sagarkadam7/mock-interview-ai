/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        aura: {
          black: "#000000",
          coral: "#FF7E5F",
          violet: "#9D50BB",
          muted: "#888888",
          cta: "#F2F2F2",
          frame: "rgba(255,255,255,0.08)",
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
        glass: "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 12px 40px -12px rgba(0,0,0,0.55)",
        enterprise: "0 1px 2px rgba(0,0,0,0.5), 0 8px 24px -8px rgba(0,0,0,0.6)",
        "glow-coral": "0 0 40px -6px rgba(255, 126, 95, 0.35)",
        "glow-violet": "0 0 40px -6px rgba(157, 80, 187, 0.35)",
      },
      backgroundImage: {
        "gradient-cta": "linear-gradient(135deg, #FF7E5F 0%, #9D50BB 100%)",
        "gradient-progress": "linear-gradient(90deg, #FF7E5F, #9D50BB)",
        "aura-dots":
          "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
