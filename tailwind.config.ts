import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        /** Nombre de producto y titulares: Playfair explícito */
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        skailea: {
          cream: "var(--cream)",
          blush: "var(--blush)",
          rose: "var(--rose)",
          deep: "var(--deep)",
          gold: "var(--gold)",
          charcoal: "var(--charcoal)",
        },
      },
      keyframes: {
        "upload-indeterminate": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(350%)" },
        },
        "promo-marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "upload-indeterminate":
          "upload-indeterminate 1.1s ease-in-out infinite",
        "promo-marquee": "promo-marquee 42s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
