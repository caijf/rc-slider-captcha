import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import autoprefixer from 'autoprefixer';
import cssvariables from 'postcss-css-variables';
import postcss from 'rollup-plugin-postcss';

export default {
  input: './src/index.tsx',
  output: [
    {
      file: 'dist/index.cjs.js',
      exports: 'named',
      format: 'cjs'
    },
    {
      file: 'dist/index.esm.js',
      format: 'es'
    }
  ],
  external: ['react', 'rc-hooks', 'classnames', 'tslib'],
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript({
      include: ['src/**/*'],
      exclude: ['src/demos/**/*']
    }),
    postcss({
      inject: true,
      extensions: ['.less'],
      plugins: [autoprefixer, cssvariables({ preserve: true })]
    })
  ]
};
