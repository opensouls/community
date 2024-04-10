import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    center: true,
    container: {
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        "c-green": "#4e9a06",
        "c-red": "#cc0000",
        "c-yellow": "#c4a000",
        "c-blue": "#729fcf",
        "c-magenta": "#75507b",
        "c-cyan": "#06989a",
        "c-white": "#d3d7cf",
        "c-bright-black": "#555753",
        "c-bright-red": "#ef2929",
        "c-bright-green": "#8ae234",
        "c-bright-yellow": "#fce94f",
        "c-bright-blue": "#32afff",
        "c-bright-magenta": "#ad7fa8",
        "c-bright-cyan": "#34e2e2",
        "c-bright-white": "#ffffff",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        "cranky-terminal": ["var(--font-cranky-terminal)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        blocky: "4px 4px 0px 0px #333",
      },
    },
  },
  safelist: [
    "text-c-green",
    "text-c-red",
    "text-c-yellow",
    "text-c-blue",
    "text-c-magenta",
    "text-c-cyan",
    "text-c-white",
    "text-c-bright-black",
    "text-c-bright-red",
    "text-c-bright-green",
    "text-c-bright-yellow",
    "text-c-bright-blue",
    "text-c-bright-magenta",
    "text-c-bright-cyan",
    "text-c-bright-white",
  ],
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
