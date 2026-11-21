/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Títulos: Courgette · Subtítulos: Philosopher · Textos y botones: Lora · Párrafos: Roboto
        serif: ['var(--font-courgette)', 'cursive'],
        subtitulo: ['var(--font-philosopher)', 'sans-serif'],
        sans: ['var(--font-lora)', 'Georgia', 'serif'],
        texto: ['var(--font-roboto)', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
