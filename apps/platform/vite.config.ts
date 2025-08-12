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
      '@solana/web3.js': path.resolve(__dirname, 'node_modules/@solana/web3.js'),
      '@solana/wallet-adapter-react': path.resolve(
        __dirname,
        'node_modules/@solana/wallet-adapter-react',
      ),
      '@solana/spl-token': path.resolve(__dirname, 'node_modules/@solana/spl-token'),

      // your other alias stays the same
      crypto: 'crypto-browserify',
    },
    dedupe: [
      'react',
      'react-dom',
      '@solana/web3.js',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      '@solana/spl-token',
    ],
  },
  plugins: [
    react({ jsxRuntime: 'classic' }),
  ],
})
