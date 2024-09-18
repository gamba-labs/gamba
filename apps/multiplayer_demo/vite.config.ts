import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const ENV_PREFIX = ['VITE_']

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 4002, host: false },
  assetsInclude: ['**/*.glb'],
  define: { 'process.env.ANCHOR_BROWSER': true },
  resolve: { alias: { crypto: 'crypto-browserify' } },
  plugins: [
    react({ jsxRuntime: 'classic' }),
  ],
}))
