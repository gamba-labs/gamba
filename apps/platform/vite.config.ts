// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  server: { port: 4001, host: false },
  envPrefix: ['VITE_'],
  assetsInclude: ['**/*.glb'],
  define: { 'process.env.ANCHOR_BROWSER': true },
  resolve: {
    alias: {
      // === POINT TO THE PACKAGE FOLDERS, NOT entry files ===
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),

      // your other alias stays the same
      crypto: 'crypto-browserify',
    },
    dedupe: ['react', 'react-dom']
  },
  plugins: [
    react({ jsxRuntime: 'classic' }),
  ],
})
