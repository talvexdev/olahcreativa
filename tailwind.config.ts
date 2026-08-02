import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

// Design direction: "light table / contact sheet" — a darkroom review table,
// not a generic dark-mode portfolio. Warm charcoal-green (not pure black),
// archival paper, and a single muted brass accent used sparingly.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1B1F1A",      // primary background — warm charcoal-green
        paper: "#EFEBE2",    // primary foreground / cards — archival paper
        brass: "#A9793B",    // single accent — muted metallic, used sparingly
        moss: "#545C46",     // secondary tone — borders, muted text
        rust: "#7A3B2E",     // rare accent — active/selected state only
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "hero": ["clamp(2.5rem, 6vw, 6rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
      },
      maxWidth: {
        "8xl": "96rem",
      },
    },
  },
  plugins: [typography],
};

export default config;
