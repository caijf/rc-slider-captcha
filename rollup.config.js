import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';

export default {
  input: './src/index.tsx',
  output: [
    {
      file: 'dist/index.cjs.js',
      exports: 'named',
      format: 'cjs',
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
    },
  ],
  external: ['react', 'classnames'],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      include: ['src/**/*'],
      exclude: ['src/demos/**/*'],
      compilerOptions: {
        declarationDir: 'dist',
      },
    }),
    postcss({
      inject: true,
      extensions: ['.less'],
      plugins: [require('autoprefixer'), require('postcss-css-variables')({ preserve: true })],
    }),
  ],
};
