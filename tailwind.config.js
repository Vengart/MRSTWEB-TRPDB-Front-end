/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Это заставит Tailwind сканировать все файлы в папке src и подпапках
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}