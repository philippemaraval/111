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
        sand: "#f5f2eb",
        ochre: "#ff8a34",
        terracotta: "#ff5c52",
        sea: "#129fd4",
        navy: "#12202f",
        sun: "#ffd43b",
        olive: "#39875a",
        foam: "#ffffff"
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
        card: "0 24px 70px rgba(18, 32, 47, 0.12)",
        soft: "0 10px 30px rgba(18, 32, 47, 0.08)"
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(24, 50, 71, 0.08) 1px, transparent 0)",
        sunburst: "linear-gradient(135deg, #11a7df 0%, #28b9ec 58%, #8edfff 100%)"
      }
    }
  },
  plugins: []
};

export default config;
