/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f172a',
        'sidebar': '#020617',
        'card': '#1e293b',
        'accent': '#38bdf8',
        'success': '#22c55e',
        'warning': '#facc15',
        'danger': '#ef4444',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8'
      }
    },
  },
  plugins: [],
}
