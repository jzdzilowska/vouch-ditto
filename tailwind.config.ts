import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0a0a0d",
        card: "rgba(255,255,255,0.06)",
        "card-solid": "#15151C",
        ink: "#f4f1ea",
        muted: "#A8A29E",
        // Warm sensual palette — mirrors the .hero-* gradients.
        accent: "#d28865",   // copper
        accent2: "#e8a575",  // honey
        warm: "#e8c4a0",
        blush: "#d4908a",
        dusk: "#8e4a6a",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "Cambria", "Times New Roman", "serif"],
        italic: ["var(--font-italic)", "Georgia", "serif"],
        typewriter: ["var(--font-typewriter)", "Courier New", "monospace"],
      },
      animation: {
        "gradient-drift": "gradientDrift 12s ease infinite",
      },
      keyframes: {
        gradientDrift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
