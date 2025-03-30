import animate from 'tailwindcss-animate'
import { setupInspiraUI } from '@inspira-ui/plugins'

export default {
  darkMode: 'selector',
  safelist: ['dark'],
  prefix: '',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
    './node_modules/@inspira-ui/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        app: {
          fuchsia: {
            DEFAULT: '#ff00ff',
            light: '#ff4dff',
            dark: '#cc00cc',
            '900': '#9900ff',
            '600': '#cc00ff',
            '500': '#d633ff',
            '400': '#df66ff',
            '300': '#e999ff',
            '200': '#f2ccff',
            '100': '#f9e6ff',
            '50': '#fcf2ff',
          },
          violet: {
            DEFAULT: '#9900ff',
            light: '#b44dff',
            dark: '#7700cc',
            '900': '#6600ff',
            '600': '#8c33ff',
            '500': '#9f59ff',
            '400': '#b380ff',
            '300': '#c8a6ff',
            '200': '#dcccff',
            '100': '#efe6ff',
            '50': '#f7f2ff',
          },
          black: {
            DEFAULT: '#000000',
            '90': 'rgba(0, 0, 0, 0.9)',
            '80': 'rgba(0, 0, 0, 0.8)',
            '40': 'rgba(0, 0, 0, 0.4)',
            '30': 'rgba(0, 0, 0, 0.3)',
            '20': 'rgba(0, 0, 0, 0.2)',
            '10': 'rgba(0, 0, 0, 0.1)',
          },
          white: {
            DEFAULT: '#f8f9fa',
          },
        },
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'gradient-fuchsia': 'linear-gradient(to right, #ff00ff, #9900ff, #6600ff)',
        'gradient-fuchsia-hover': 'linear-gradient(to right, #ff33ff, #a64dff, #7f33ff)',
      },
    },
  },

  plugins: [animate, setupInspiraUI],
}
