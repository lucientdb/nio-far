import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        xs:   ["0.8125rem",  { lineHeight: "1.6" }],   // 13px
        sm:   ["0.9375rem",  { lineHeight: "1.7" }],   // 15px
        base: ["1.0625rem",  { lineHeight: "1.8" }],   // 17px
        lg:   ["1.1875rem",  { lineHeight: "1.75" }],  // 19px
        xl:   ["1.3125rem",  { lineHeight: "1.7" }],   // 21px
        "2xl":["1.5rem",     { lineHeight: "1.4" }],   // 24px
        "3xl":["1.875rem",   { lineHeight: "1.3" }],   // 30px
        "4xl":["2.25rem",    { lineHeight: "1.2" }],   // 36px
        "5xl":["3rem",       { lineHeight: "1.1" }],   // 48px
      },
      spacing: {
        "touch": "48px", // taille minimum zone cliquable
      },
    },
  },
  plugins: [],
};

export default config;