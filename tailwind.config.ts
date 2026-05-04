import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B0B0F",
        card: "rgba(255,255,255,0.06)",
        "card-solid": "#15151C",
        ink: "#F4F1EA",
        muted: "#A8A29E",
        accent: "#C8553D",
        accent2: "#D4A574",
        warm: "#E8C4A0",
        blush: "#D4908A",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Helvetica", "Arial", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "Cambria", "Times New Roman", "serif"],
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
