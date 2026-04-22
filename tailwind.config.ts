module.exports = {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn / theme primitives
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // Shiplo brand
        brand: {
          primary: "hsl(var(--brand-primary))",
          "primary-contrast": "hsl(var(--brand-primary-contrast))",
          secondary: "hsl(var(--brand-secondary))",
          "secondary-contrast": "hsl(var(--brand-secondary-contrast))",
        },

        // Semantic status colors
        success: {
          DEFAULT: "hsl(var(--status-success))",
          soft: "hsl(var(--status-success-soft))",
          strong: "hsl(var(--status-success-strong))",
        },
        warning: {
          DEFAULT: "hsl(var(--status-warning))",
          soft: "hsl(var(--status-warning-soft))",
          strong: "hsl(var(--status-warning-strong))",
        },
        error: {
          DEFAULT: "hsl(var(--status-error))",
          soft: "hsl(var(--status-error-soft))",
          strong: "hsl(var(--status-error-strong))",
        },
        info: {
          DEFAULT: "hsl(var(--status-info))",
          soft: "hsl(var(--status-info-soft))",
          strong: "hsl(var(--status-info-strong))",
        },

        // Neutral scale
        neutral: {
          0: "hsl(var(--neutral-0))",
          50: "hsl(var(--neutral-50))",
          100: "hsl(var(--neutral-100))",
          150: "hsl(var(--neutral-150))",
          200: "hsl(var(--neutral-200))",
          250: "hsl(var(--neutral-250))",
          300: "hsl(var(--neutral-300))",
          400: "hsl(var(--neutral-400))",
          500: "hsl(var(--neutral-500))",
          600: "hsl(var(--neutral-600))",
          700: "hsl(var(--neutral-700))",
          900: "hsl(var(--neutral-900))",
        },

        // Legacy aliases retained for existing markup
        "grey-01": "var(--grey-01)",
        "grey-02": "var(--grey-02)",
        "grey-11": "var(--grey-11)",
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "system-ui", "sans-serif"],
        body: ["Poppins", "Inter", "system-ui", "sans-serif"],
        heading: ["Montserrat", "Poppins", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        // Legacy text-style aliases
        "body-body-1": "var(--body-body-1-font-family)",
        "body-medium": "var(--body-medium-font-family)",
        "body-text": "var(--body-text-font-family)",
        "body-text-xs": "var(--body-text-xs-font-family)",
        "data-grid-entries": "var(--data-grid-entries-font-family)",
        "heading-5-medium": "var(--heading-5-medium-font-family)",
        "subtitle-2": "var(--subtitle-2-font-family)",
        "subtitle-2-medium": "var(--subtitle-2-medium-font-family)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
    },
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
  darkMode: ["class"],
};
