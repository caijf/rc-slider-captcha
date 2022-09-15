import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'rc-slider-captcha',
  favicon:
    'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  logo: 'https://user-images.githubusercontent.com/9554297/83762004-a0761b00-a6a9-11ea-83b4-9c8ff721d4b8.png',
  outputPath: 'docs-dist',
  // more config: https://d.umijs.org/config
  esbuild: false,
  nodeModulesTransform: {
    type: 'all',
  },
  targets: {
    ie: 11,
  },
  polyfill: {
    imports: ['element-remove', 'core-js'],
  },
  headScripts: [
    {
      src: 'https://cdn.bootcdn.net/ajax/libs/vConsole/3.13.0/vconsole.min.js',
    },
    {
      content: 'var vConsole = new window.VConsole();',
    },
  ],
});
