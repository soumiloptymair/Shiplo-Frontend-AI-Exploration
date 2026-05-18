/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,scss}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "hsl(var(--brand-primary))",
          "primary-contrast": "hsl(var(--brand-primary-contrast))",
          secondary: "hsl(var(--brand-secondary))",
          "secondary-contrast": "hsl(var(--brand-secondary-contrast))",
        },
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
        "status-picking": "hsl(var(--status-picking))",
        "status-picking-strong": "hsl(var(--status-picking-strong))",
        "status-shipped": "hsl(var(--status-shipped))",
        "status-label-created": "hsl(var(--status-label-created))",
        "status-delayed": "hsl(var(--status-delayed))",
        "status-delivered": "hsl(var(--status-delivered))",
        "status-on-hold": "hsl(var(--status-on-hold))",
        "status-needs-review": "hsl(var(--status-needs-review))",
        "status-cancelled": "hsl(var(--status-cancelled))",
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
        "grey-01": "var(--grey-01)",
        "grey-02": "var(--grey-02)",
      },
      fontFamily: {
        body: ["Roboto", "Helvetica", "system-ui", "sans-serif"],
        heading: ["Montserrat", "Roboto", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
