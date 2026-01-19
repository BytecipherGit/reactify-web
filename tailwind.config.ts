import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "rgb(var(--brand-primary) / <alpha-value>)",
          secondary: "rgb(var(--brand-secondary) / <alpha-value>)",
          accent: "rgb(var(--brand-accent) / <alpha-value>)",
          highlight: "rgb(var(--brand-highlight) / <alpha-value>)",
        },
        gray: {
          50: "rgb(var(--gray-50) / <alpha-value>)",
          100: "rgb(var(--gray-100) / <alpha-value>)",
          200: "rgb(var(--gray-200) / <alpha-value>)",
          300: "rgb(var(--gray-300) / <alpha-value>)",
          400: "rgb(var(--gray-400) / <alpha-value>)",
          500: "rgb(var(--gray-500) / <alpha-value>)",
          600: "rgb(var(--gray-600) / <alpha-value>)",
          700: "rgb(var(--gray-700) / <alpha-value>)",
          800: "rgb(var(--gray-800) / <alpha-value>)",
          900: "rgb(var(--gray-900) / <alpha-value>)",
        },
        success: "rgb(var(--success) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        "success-light": "rgb(var(--success-light) / <alpha-value>)",
        "warning-light": "rgb(var(--warning-light) / <alpha-value>)",
        "error-light": "rgb(var(--error-light) / <alpha-value>)",
        "info-light": "rgb(var(--info-light) / <alpha-value>)",
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-dark": "rgb(var(--bg-dark) / <alpha-value>)",
        "bg-secondary": "rgb(var(--bg-secondary) / <alpha-value>)",
        "bg-tertiary": "rgb(var(--bg-tertiary) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        "border-secondary": "rgb(var(--border-secondary) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "card-hover": "rgb(var(--card-hover) / <alpha-value>)",
      },
      transitionDuration: {
        "200": "200ms",
        "300": "300ms",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-secondary": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "gradient-accent": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "gradient-brand": "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f5576c 100%)",
        "gradient-rainbow": "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f5576c 50%, #00f2fe 75%, #667eea 100%)",
      },
      boxShadow: {
        brand: "0 4px 12px rgba(102, 126, 234, 0.4)",
      },
      animation: {
        gradient: "gradient 15s ease infinite",
        "spin-slow": "spin 2s linear infinite",
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        gradient: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
    },
  },
  plugins: [
    function ({ addUtilities }: any) {
      const newUtilities = {
        ".text-gradient-primary": {
          "background-image": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".text-gradient-secondary": {
          "background-image": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".text-gradient-accent": {
          "background-image": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".text-gradient-brand": {
          "background-image": "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f5576c 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".heading-gradient": {
          "background-image": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "font-weight": "700",
        },
      };
      addUtilities(newUtilities);
    },
  ],
} satisfies Config;
