import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#f8ead2",
        ochre: "#d98943",
        terracotta: "#bf5f3c",
        sea: "#2f7b84",
        navy: "#183247",
        sun: "#f8b84e",
        olive: "#5d6543",
        foam: "#f9f4eb"
      },
      fontFamily: {
        display: [
          "var(--font-display)"
        ],
        body: [
          "var(--font-body)"
        ]
      },
      boxShadow: {
        card: "0 20px 45px rgba(24, 50, 71, 0.14)",
        soft: "0 12px 24px rgba(24, 50, 71, 0.12)"
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(24, 50, 71, 0.08) 1px, transparent 0)",
        sunburst: "linear-gradient(135deg, rgba(248, 184, 78, 0.14), rgba(217, 137, 67, 0.08) 45%, rgba(47, 123, 132, 0.12))"
      }
    }
  },
  plugins: []
};

export default config;
