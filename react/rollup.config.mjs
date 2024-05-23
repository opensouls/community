import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import postcss from "rollup-plugin-postcss";

import packageJson from "./package.json" assert { type: "json" };

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        inlineDynamicImports: true,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        inlineDynamicImports: true,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        browser: true,
        // preferBuiltins: false,
      }),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
      postcss(),
    ],
    external: ['react', 'react-dom'],
  },
  {
    input: "dist/esm/types/index.d.ts",
    output: [{
      file: "dist/index.d.ts",
      format: "esm",
    }],
    plugins: [dts()],
    external: ['react', 'react-dom', /\.css$/]
  },
];