import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Supabase Brand Palette
        sb: {
          brand: "#3ecf8e",
          "brand-hover": "#34b27b",
          "brand-light": "#70e5b3",
          "brand-dark": "#1e3a2f",
          "brand-bg": "rgba(62, 207, 142, 0.1)",
          
          // Dark Surfaces
          bg: "#121212",
          "surface-75": "#171717",
          "surface-100": "#1c1c1c",
          "surface-200": "#232323",
          "surface-300": "#2c2c2c",
          
          // Borders
          border: "#282828",
          "border-strong": "#383838",
          
          // Text
          title: "#ededed",
          body: "#a1a1aa",
          muted: "#71717a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
