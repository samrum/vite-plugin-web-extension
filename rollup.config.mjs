import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json" assert { type: "json" };

const external = ["node:crypto", "node:fs/promises", "node:path"].concat(
  Object.keys(pkg.dependencies ?? {})
);

export default {
  input: "src/index.ts",
  plugins: [typescript({ sourceMap: false })],
  external,
  output: [
    { format: "cjs", file: pkg.main, exports: "auto" },
    { format: "esm", file: pkg.module },
  ],
};
