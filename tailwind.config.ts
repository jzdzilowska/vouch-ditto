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
        card: "#15151C",
        ink: "#F4F1EA",
        muted: "#8A8B95",
        accent: "#FF5A78",
        accent2: "#7C5CFF",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Helvetica", "Arial"],
        display: ["ui-serif", "Georgia", "Cambria", "Times New Roman"],
      },
    },
  },
  plugins: [],
};
export default config;
