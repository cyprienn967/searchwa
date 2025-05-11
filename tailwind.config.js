/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderColor: {
        border: "var(--border)",
      },
      ringColor: {
        ring: "var(--ring)",
      },
      outlineColor: {
        ring: "var(--ring)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            h1: {
              fontFamily: 'Times New Roman, Times, serif',
            },
            h2: {
              fontFamily: 'Times New Roman, Times, serif',
            },
            h3: {
              fontFamily: 'Times New Roman, Times, serif',
            },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
} 