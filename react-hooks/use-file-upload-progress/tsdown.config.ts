import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm"],
  dts: true, // generate .d.ts automatically
  sourcemap: true,
  minify: false, // optional, good for debugging
  external: ["react"], // don’t bundle React
});
