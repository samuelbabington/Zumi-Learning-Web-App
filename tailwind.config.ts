import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        pink: {
          DEFAULT: "#FF5F7E",
          50: "#FFF0F3",
          100: "#FFD6DE",
          200: "#FFB3C1",
          300: "#FF8FA5",
          400: "#FF7390",
          500: "#FF5F7E",
          600: "#F03D60",
          700: "#D42850",
          800: "#A81D40",
          900: "#7C1430",
        },
        // Dark theme surface palette
        zumi: {
          bg: "var(--zumi-bg)",
          surface: "var(--zumi-surface)",
          "surface-2": "var(--zumi-surface-2)",
          border: "var(--zumi-border)",
          text: "var(--zumi-text)",
          muted: "var(--zumi-muted)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #FF5F7E 0%, #FF9A5C 100%)",
        "gradient-brand-v": "linear-gradient(180deg, #FF5F7E 0%, #FF9A5C 100%)",
        "gradient-surface": "linear-gradient(135deg, var(--zumi-surface) 0%, var(--zumi-surface-2) 100%)",
      },
      boxShadow: {
        "pink-sm": "0 2px 12px rgba(255, 95, 126, 0.25)",
        "pink-md": "0 4px 24px rgba(255, 95, 126, 0.35)",
        "pink-lg": "0 8px 40px rgba(255, 95, 126, 0.45)",
        "surface-sm": "0 1px 4px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.06)",
        "surface-md": "0 4px 16px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "bounce-soft": "bounceSoft 0.6s ease-out",
        "pulse-pink": "pulsePink 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        slideInRight: { from: { opacity: "0", transform: "translateX(12px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        bounceSoft: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.04)" } },
        pulsePink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
    },
  },
  plugins: [animate],
};

export default config;
