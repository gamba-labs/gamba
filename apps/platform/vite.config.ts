import react from '@vitejs/plugin-react'
import Unfonts from 'unplugin-fonts/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

const ENV_PREFIX = ['GAMBA_', 'VITE_']

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 4001, host: true },
  define: { 'process.env.ANCHOR_BROWSER': true },
  plugins: [
    react(),
    Unfonts({
      google: {
        families: [
          {
            name: 'Oxanium',
            styles: 'wght@400;700',
          },
          {
            name: 'Righteous',
            styles: 'wght@400;700',
          },
        ],
      },
    }),
    VitePWA({
      base: '/',
      workbox: {
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Gamba Play',
        short_name: 'Gamba',
        theme_color: '#FF5555',
        background_color: '#000000',
        display: 'standalone',
        description: '',
        icons: [
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  // resolve: {
  //   alias: [
  //     { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
  //   ],
  // },
}))
