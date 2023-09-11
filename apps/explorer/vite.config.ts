import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const ENV_PREFIX = ['GAMBA_', 'VITE_']

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 7777 },
  resolve: { alias: { '@src': path.resolve(__dirname, './src') } },
  plugins: [
    react(),
    VitePWA({
      base: '/',
      includeAssets: [
        '/favicon.png',
      ],
      manifest: {
        name: 'Gamba Explorer',
        short_name: 'GambaExplorer',
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
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
      },
    }),
  ],
}))
