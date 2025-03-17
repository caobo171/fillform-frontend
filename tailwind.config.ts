import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
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
          light: '#f2e1e2',
          normal: '#e8bec0',
          DEFAULT: '#e02329',
          dark: '#ed5e21',
          50: '#FAEEEE',
          100: '#f2e1e2',
          200: '#ffcbcd',
          300: '#ffb1b4',
          400: '#ffb1b4',

          500: '#ee8a8e',
          600: '#eb7e82',
          700: '#df6d71',
          800: '#d9676b',
          900: '#dc464a',
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
