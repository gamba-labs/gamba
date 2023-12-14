import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "url"
import { defineConfig } from "vite"

const ENV_PREFIX = ["GAMBA_", "VITE_"]

export default defineConfig(() => ({
  envPrefix: ENV_PREFIX,
  server: { port: 4000, host: false },
  define: { "process.env.ANCHOR_BROWSER": true },
  plugins: [
    react({ jsxRuntime: 'classic' }),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: fileURLToPath(new URL("./src", import.meta.url)) },
    ],
  },
}))
