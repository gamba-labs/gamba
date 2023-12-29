import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const ENV_PREFIX = ['VITE_']

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 4001, host: false },
  define: { 'process.env.ANCHOR_BROWSER': true },
  plugins: [
    react({ jsxRuntime: 'classic' }),
    // Unfonts({
    //   google: {
    //     families: [
    //       {
    //         name: 'Righteous',
    //         styles: 'wght@400;700',
    //       },
    //     ],
    //   },
    // }),
    // VitePWA({
    //   base: '/',
    //   workbox: { cleanupOutdatedCaches: true },
    //   manifest: {
    //     name: 'Gamba Play',
    //     short_name: 'Gamba',
    //     theme_color: '#FF5555',
    //     background_color: '#000000',
    //     display: 'standalone',
    //     description: '',
    //     icons: [
    //       {
    //         src: '/icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //       {
    //         src: '/icon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //     ],
    //   },
    // }),
  ],
  // resolve: {
  //   alias: [
  //     { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
  //   ],
  // },
}))
