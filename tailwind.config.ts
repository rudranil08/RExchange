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
        background: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
          elevated2: "var(--surface-elevated-2)",
        },
        foreground: "var(--foreground)",
        "muted-foreground": "var(--muted-foreground)",
        "subtle-foreground": "var(--subtle-foreground)",
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },

        // Purple Accent
        purple: {
          accent: "var(--accent-purple)",
          bright: "var(--accent-purple-bright)",
          surface: "var(--accent-purple-surface)",
        },

        // Semantic Exchange Palette
        have: {
          DEFAULT: "var(--have)",
          muted: "var(--have-muted)",
          border: "var(--have-border)",
        },
        need: {
          DEFAULT: "var(--need)",
          muted: "var(--need-muted)",
          border: "var(--need-border)",
        },
        match: {
          DEFAULT: "var(--match)",
          muted: "var(--match-muted)",
          border: "var(--match-border)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Liberation Mono"',
          '"Courier New"',
          "monospace",
        ],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        card: "10px",
        lg: "10px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
