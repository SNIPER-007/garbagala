import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A090D", // Deep Obsidian
        card: "#14121B",       // Rich Charcoal Card
        "card-border": "#272435",
        accent: {
          gold: "#F7B731",     // Festival Gold
          amber: "#FF9F1C",    // Warm Saffron Amber
          crimson: "#E03616",  // Vibrant Vermilion Accent
          emerald: "#10B981",  // Live Verification Green
          purple: "#7000FF",   // Royal Garba Glow
        },
        muted: {
          DEFAULT: "#8E8A9F",
          foreground: "#B5B1C5",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        heading: ["var(--font-heading)", "Outfit", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #FF9F1C 0%, #F7B731 50%, #D48806 100%)",
        "card-glow": "radial-gradient(circle at top right, rgba(255, 159, 28, 0.12), transparent 70%)",
        "hero-glow": "radial-gradient(circle at 50% 20%, rgba(224, 54, 22, 0.18), rgba(112, 0, 255, 0.12), transparent 75%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
