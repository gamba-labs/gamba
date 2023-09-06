import react from '@vitejs/plugin-react'
import path from 'path'
import Unfonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'

const ENV_PREFIX = ['GAMBA_', 'VITE_']

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 7778 },
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
