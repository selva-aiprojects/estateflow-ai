import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        surface: "hsl(var(--surface))",
        "surface-muted": "hsl(var(--surface-muted))",
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        text: "hsl(var(--text))",
        "text-muted": "hsl(var(--text-muted))",
        "text-subtle": "hsl(var(--text-subtle))",
        primary: "hsl(var(--primary))",
        "primary-hover": "hsl(var(--primary-hover))",
        "primary-soft": "hsl(var(--primary-soft))",
        accent: "hsl(var(--accent))",
        success: "hsl(var(--success))",
        "success-soft": "hsl(var(--success-soft))",
        warning: "hsl(var(--warning))",
        "warning-soft": "hsl(var(--warning-soft))",
        danger: "hsl(var(--danger))",
        "danger-soft": "hsl(var(--danger-soft))",
        info: "hsl(var(--info))",
        "info-soft": "hsl(var(--info-soft))",
        sidebar: "hsl(var(--sidebar))",
        hero: "hsl(var(--hero))",
        "hero-soft": "hsl(var(--hero-soft))",
        "hero-border": "hsl(var(--hero-border))",
        teal: "hsl(var(--teal))",
        "teal-soft": "hsl(var(--teal-soft))",
      },
      borderRadius: {
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      boxShadow: {
        card: "0 1px 2px 0 hsl(var(--shadow) / 0.05), 0 1px 3px 0 hsl(var(--shadow) / 0.08)",
        lift: "0 4px 12px -2px hsl(var(--shadow) / 0.12), 0 2px 4px -2px hsl(var(--shadow) / 0.06)",
        focus: "0 0 0 3px hsl(var(--primary) / 0.25)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
