import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f4f8e8',
          100: '#e6f0c4',
          500: '#90ad25',
          600: '#7a9420',
          700: '#657c1a',
        },
        mf: {
          blue:   '#1a7c98',
          navy:   '#273673',
          violet: '#421e47',
          orange: '#f7b91f',
          red:    '#eb5a37',
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
