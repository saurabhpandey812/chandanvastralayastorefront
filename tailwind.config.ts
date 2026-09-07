import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        myntra: '#ff3f6c',
        'myntra-dark': '#e63660',
        ink: '#282c3f',
        'ink-soft': '#535766',
        muted: '#94969f',
        line: '#eaeaec',
        paper: '#ffffff',
        mist: '#f5f5f6',
        forest: '#03a685',
        orange: '#ff905a',
        gold: '#ffc832',
      },
      fontFamily: {
        sans: ['var(--font-assistant)'],
      },
      maxWidth: {
        content: '1170px',
        store: '1400px',
      },
      boxShadow: {
        nav: '0 4px 12px rgba(40,44,63,.08)',
        card: '0 2px 16px rgba(40,44,63,.08)',
      },
    },
  },
  plugins: [],
};

export default config;
