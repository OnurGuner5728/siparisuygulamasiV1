/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B6B',
          light: '#FF8E8E',
          dark: '#E05151',
        },
        secondary: {
          DEFAULT: '#4ECDC4',
          light: '#7AD9D3',
          dark: '#3AABA3',
        },
        accent: {
          DEFAULT: '#FFB347',
          light: '#FFC575',
          dark: '#E09A3A',
        },
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

