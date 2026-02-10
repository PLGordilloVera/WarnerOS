import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 10000000,
      },
      manifest: {
        name: 'WarnerOS',
        short_name: 'WarnerOS',
        description: 'Sistema de Gestión Inmobiliaria',
        // 👇 AQUÍ ESTÁ EL CAMBIO: AZUL WARNER
        theme_color: '#002b5c',      // Color de la barra de estado del celu
        background_color: '#002b5c', // Color de fondo mientras carga el logo
        // 👆 --------------------------------
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})