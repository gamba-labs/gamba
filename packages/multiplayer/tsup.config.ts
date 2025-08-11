import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,          
  treeshake: true,
  external: [           
    "@coral-xyz/anchor",
    "@solana/web3.js"
  ]
});
