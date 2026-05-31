import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1B2B",
        koi: {
          50: "#F1F8FE",
          100: "#E0EFFA",
          200: "#BFE0F5",
          300: "#88C8EC",
          400: "#4AAADC",
          500: "#1E8DC6",
          600: "#1271A6",
          700: "#0F5A87",
          800: "#0B4267",
          900: "#082F4A",
        },
        accent: {
          red: "#E63946",
          gold: "#E2A03F",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Playfair Display"', "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(15,90,135,0.25)",
        card: "0 8px 30px -8px rgba(11,27,43,0.18)",
      },
      backgroundImage: {
        "water-gradient":
          "linear-gradient(135deg,#E0EFFA 0%,#BFE0F5 40%,#88C8EC 100%)",
        "deep-water":
          "linear-gradient(180deg,#082F4A 0%,#0F5A87 60%,#1271A6 100%)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        ripple: {
          "0%": { transform: "scale(0.95)", opacity: "0.8" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        ripple: "ripple 2.4s ease-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
