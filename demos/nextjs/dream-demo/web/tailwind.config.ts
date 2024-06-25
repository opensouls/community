import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
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
        heading: ["var(--font-heading)", ...fontFamily.sans],
        "fallback-sans": "sans-serif",
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
        'spiral-rotate': {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg) scale(1)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg) scale(0)' },
        },
        'melting': {
          '0%, 100%': { transform: 'translate(-50%, -50%)', opacity: '1' },
          '50%': { transform: 'translate(-50%, 100%)', opacity: '0' },
        },
        'fractal-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'tunnel-move': {
          '0%': { transform: 'translateZ(-500px)' },
          '100%': { transform: 'translateZ(500px)' },
        },
        'tunnel-rotate': {
          '0%': { transform: 'translateZ(-500px) scale(3) rotate(0deg)' },
          '100%': { transform: 'translateZ(-500px) scale(3) rotate(360deg)' },
        },
        'grain-move': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(4px)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'spiral-rotate': 'spiral-rotate 10s linear infinite',
        'melting': 'melting 5s ease-in-out infinite alternate',
        'fractal-spin': 'fractal-spin 10s linear infinite reverse',
        'tunnel-move': 'tunnel-move 10s ease-in-out infinite alternate',
        'tunnel-rotate': 'tunnel-rotate 5s linear infinite',
        'grain-move': 'grain-move 0.5s steps(4) infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

