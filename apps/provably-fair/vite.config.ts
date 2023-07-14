import react from '@vitejs/plugin-react'
import path from 'path'
import Unfonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'

export default defineConfig(() => ({
  server: { port: 7777, host: true },
  resolve: { alias: { '@src': path.resolve(__dirname, './src') } },
  define: { 'process.env.ANCHOR_BROWSER': true },
  plugins: [
    react(),
    Unfonts({
      google: {
        families: [
          {
            name: 'Roboto Mono',
            styles: 'wght@400;700',
          },
        ],
      },
    }),
  ],
}))
