import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.tsx'],
  noExternal: ['lib'],
  sourcemap: true,
  esbuildOptions(options, context) {
    options.assetNames = 'assets/[name]'
  },
  loader: {
    '.mp3': 'dataurl',
    '.png': 'dataurl',
    '.glb': 'dataurl',
  },
})
