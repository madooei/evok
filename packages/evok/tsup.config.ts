import { defineConfig } from "tsup";

export default defineConfig({
  target: "node20",
  entry: ["src/index.ts", "src/helpers/index.ts"],
  outDir: "dist",
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  dts: true,
  splitting: true,
  treeshake: true,
  esbuildOptions(options) {
    options.alias = {
      "@": "./src",
    };
  },
});
