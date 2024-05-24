/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxHeight: {
        'screen-80': '80vh',
        'screen-60': '70vh',
      },
    },
  },
  plugins: [],
}
