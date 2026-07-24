import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kcs: {
          bg: "#061426",
          panel: "#081B30",
          sidebar: "#031024",
          card: "#0B1F35",
          elevated: "#102841",
          gold: "#F5B82E",
          gold2: "#D99C1D",
          goldLight: "#FFD96A",
          cyan: "#27C4F4",
          success: "#32C76A",
          warning: "#F4B740",
          danger: "#E5574F",
          text: "#F7F9FC",
          muted: "#AEBBCD",
          border: "rgba(255,255,255,0.10)"
        }
      },
      boxShadow: {
        premium: "0 22px 60px rgba(0,0,0,0.35)",
        glow: "0 0 34px rgba(245,184,46,0.18)"
      }
    }
  },
  plugins: []
};

export default config;
