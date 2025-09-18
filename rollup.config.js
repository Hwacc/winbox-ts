import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import fs from 'fs-extra';

function copyOnce() {
  let copied = false;
  return {
    name: 'copy-once',
    buildEnd() {
      if (!copied) {
        copied = true;
        fs.copySync('src/css', 'dist/css', {
          filter: (src) => !src.endsWith('.scss') && !src.endsWith('.sass'),
        });
        fs.copySync('src/img', 'dist/img');
      }
    },
  };
}

const sourcemap = process.env.NODE_ENV !== 'production';
const basePlugins = [
  nodeResolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    exclude: ['**/*.test.ts', '**/*.spec.ts'],
  }),
  babel({
    babelHelpers: 'bundled',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    presets: ['@babel/preset-env', '@babel/preset-typescript'],
  }),
  copyOnce(),
];

// 压缩插件
const minifyPlugins = [
  terser({
    format: { comments: false },
    compress: { drop_console: true },
  }),
];

// 基础配置
const baseConfig = {
  input: 'src/ts/index.ts',
  plugins: basePlugins,
};

export default [
  // UMD
  {
    ...baseConfig,
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'WinBox',
      sourcemap,
    },
  },
  // UMD Minified
  {
    ...baseConfig,
    output: {
      file: 'dist/index.min.js',
      format: 'umd',
      name: 'WinBox',
      sourcemap,
    },
    plugins: [...baseConfig.plugins, ...minifyPlugins],
  },
  // ESM
  {
    ...baseConfig,
    output: {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap,
    },
  },
  // ESM Minified
  {
    ...baseConfig,
    output: {
      file: 'dist/index.esm.min.js',
      format: 'esm',
      sourcemap,
    },
    plugins: [...baseConfig.plugins, ...minifyPlugins],
  },
];
