import { createRequire } from "node:module";
import typescript from "@rollup/plugin-typescript";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const external = ["path", "fs", "crypto"].concat(
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
