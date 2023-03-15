import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  // optimizeDeps: { exclude: ['gamba'] },
  server: { port: 4080 },
  resolve: { alias: { '@src': path.resolve(__dirname, './src') } },
  plugins: [react()],
})
