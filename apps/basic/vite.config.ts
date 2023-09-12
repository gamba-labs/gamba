import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const ENV_PREFIX = ['GAMBA_', 'VITE_']

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 7779 },
  define: { 'process.env.ANCHOR_BROWSER': true },
  plugins: [react()],
}))
