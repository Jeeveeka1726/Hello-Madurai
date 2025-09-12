/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // CSS Variable-based colors that respond to theme
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          50: '#faf5ff',   // Very light purple
          100: '#f3e8ff',  // Light purple
          200: '#e9d5ff',  // Lighter purple
          300: '#d8b4fe',  // Medium light purple
          400: '#c084fc',  // Medium purple
          500: '#a855f7',  // Base purple
          600: '#9333ea',  // Darker purple
          700: '#7c3aed',  // Dark purple
          800: '#6b21a8',  // Very dark purple
          900: '#581c87',  // Deep purple
          950: '#3b0764',  // Deepest purple
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Pure white variants
        white: {
          50: '#ffffff',   // Pure white
          100: '#fefefe',  // Almost white
          200: '#fdfdfd',  // Very light gray
          300: '#fcfcfc',  // Light gray
          400: '#fafafa',  // Lighter gray
          500: '#f8f8f8',  // Light background
          600: '#f5f5f5',  // Background
          700: '#f0f0f0',  // Darker background
          800: '#e8e8e8',  // Border color
          900: '#e0e0e0',  // Darker border
        },
        // Neutral grays for text and subtle elements
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        'tamil': ['Noto Sans Tamil', 'sans-serif'],
        'english': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
