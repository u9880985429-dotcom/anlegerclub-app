import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // Trader IQ brand
        brand: {
          DEFAULT: "#ff741f",
          50: "#fff4ec",
          100: "#ffe5d1",
          200: "#ffc8a3",
          300: "#ffa86f",
          400: "#ff8d3f",
          500: "#ff741f",
          600: "#e85d0a",
          700: "#bf4607",
          800: "#933707",
          900: "#71290a",
        },
        // Gewinn/Verlust — gedaempfter + WCAG-AA-tauglich als Text auf Weiss
        // (vorher die hellen Tailwind-Defaults #10b981/#ef4444, beide unter AA).
        profit: "#047857",
        loss: "#b91c1c",
        // Marken-Navy als echte Flaechen-/Ink-Farbe (vorher nur neutrales shadcn-Grau).
        navy: {
          DEFAULT: "#101830",
          50: "#f4f6fb",
          100: "#e6eaf3",
          200: "#c6cee0",
          300: "#9aa6c4",
          400: "#6675a0",
          500: "#3f4f7d",
          600: "#2a3760",
          700: "#1d294a",
          800: "#141d36",
          900: "#101830",
          950: "#0a1022",
        },
        // Semantic tokens (consumed via CSS variables)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Mehrstufiger, weicher Schatten fuer hervorgehobene "card-elevated"-Flaechen
        // — erzeugt Tiefe/Hierarchie statt 192x identischer flacher Karten.
        elevated: "0 1px 2px rgba(16,24,48,0.04), 0 8px 24px -8px rgba(16,24,48,0.12)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
