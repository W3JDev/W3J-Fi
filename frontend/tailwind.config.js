/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'w3j-primary': '#0f5fd3',
        'w3j-primary-dark': '#0a4a9f',
        'w3j-primary-light': '#4d8be8',
        'w3j-accent': '#ff79c6',
        'w3j-success': '#50fa7b',
        'w3j-warning': '#ffb86c',
        'w3j-error': '#ff5555',
        'w3j-bg': '#282a36',
        'w3j-surface': '#44475a',
        'w3j-text': '#f8f8f2',
        'w3j-text-muted': '#6272a4',
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        w3jdev: {
          "primary": "#0f5fd3",
          "secondary": "#ff79c6",
          "accent": "#50fa7b",
          "neutral": "#282a36",
          "base-100": "#282a36",
          "info": "#4d8be8",
          "success": "#50fa7b",
          "warning": "#ffb86c",
          "error": "#ff5555",
        },
      },
      "light",
      "dark",
      "dracula",
    ],
  },
}

