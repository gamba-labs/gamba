import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(() => ({
  server: { port: 4444, host: true },
  define: { 'process.env.ANCHOR_BROWSER': true },
  plugins: [
    react({ jsxRuntime: 'classic' }),
  ]
}))
