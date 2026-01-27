/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta Executive
        corp: {
          bg: '#0f172a',       // Fondo principal (Azul Noche Profundo)
          card: '#1e293b',     // Fondo tarjetas (Azul Grisáceo)
          border: '#334155',   // Bordes sutiles
          text: '#f8fafc',     // Texto principal (Blanco Humo)
          muted: '#94a3b8',    // Texto secundario (Gris)
          gold: '#fbbf24',     // Dorado (Acciones/Resaltado)
          goldDim: '#d97706'   // Dorado oscuro (Bordes/Sombras)
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],    // Texto general limpio
        data: ['Rajdhani', 'sans-serif'], // Números (se mantiene Rajdhani porque es legible para data)
      }
    },
  },
  plugins: [],
}