import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontSize: {
      'xs': '12px',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
      '7xl': '4.5rem',
      '8xl': '5.25rem',
      '9xl': '6rem',
    },
    screens: {
      xs: '468px',

      'semi-xs': '540px',

      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }
      'semi-md': '960px',

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }
      'semi-lg': '1200px',

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': "url('/static/landing/bg.svg')",
      },

      boxShadow: {
        light: '0 70px 104px -20px rgba(33, 55, 103, 0.04)',
        bottom: '0 1px 0 0',
        top: '0 -1px 0 0',
        left: '-1px 0 0 0',
        right: '1px 0 0 0',
      },

      colors: {
        primary: {
          light: '#e6eefb',
          normal: '#acc7f4',
          DEFAULT: '#2563eb',
          dark: '#1e4fbc',
          50: '#f0f5fe',
          100: '#e6eefb',
          200: '#bdd4f7',
          300: '#93b5f3',
          400: '#6996ef',
          500: '#2563eb',
          600: '#1e4fbc',
          700: '#1a44a3',
          800: '#153a8a',
          900: '#0f2b66',
        },
        'gray-150': '#f0f2f5',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },

  plugins: [
    require('tailwindcss-animate'),
    require('tailwind-scrollbar'),

    require('./tailwind/clip-path.tailwind'),
    require('./tailwind/height.tailwind'),
    require('./tailwind/z-index.tailwind'),
    require('./tailwind/complex-variants.tailwind'),
  ],
};
export default config;
