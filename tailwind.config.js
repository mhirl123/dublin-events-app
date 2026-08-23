/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6d28d9',
        },
        accent: {
          pink: '#ec4899',
          orange: '#f97316',
          purple: '#7c3aed',
        },
        dark: {
          bg: '#fafbfc',
          card: '#ffffff',
          text: '#1f2937',
        },
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%)',
        'gradient-button': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
        'gradient-accent': 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
      },
      boxShadow: {
        'glow': '0 8px 32px rgba(124, 58, 237, 0.25)',
        'glow-lg': '0 12px 24px rgba(124, 58, 237, 0.2)',
      },
    },
  },
  plugins: [],
}
