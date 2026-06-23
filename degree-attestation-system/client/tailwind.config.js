/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        iqra: {
          50: '#f4f6fc',
          100: '#e7ebf7',
          200: '#cdd7f0',
          300: '#a3b7e4',
          400: '#7391d3',
          500: '#4f6ec2',
          600: '#3b53a7',
          700: '#304288',
          800: '#2c3971',
          900: '#28325e',
          950: '#1a1f3d',
        }
      }
    },
  },
  plugins: [],
}
