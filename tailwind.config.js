module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Ruda', 'sans-serif'],
        serif: ['Roboto Slab', 'serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-primeui'),
  ],
}
