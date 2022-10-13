import { defineConfig } from 'dumi';

const isDev = process.env.NODE_ENV === 'development';
const publicPath = !isDev ? '/rc-slider-captcha/' : '/';

export default defineConfig({
  title: 'rc-slider-captcha',
  history: {
    type: 'hash'
  },
  hash: true,
  publicPath,
  favicon: 'https://www.caijinfeng.com/favicon.ico',
  logo: 'https://www.caijinfeng.com/logo.png',
  outputPath: 'docs-dist',
  // more config: https://d.umijs.org/config
  esbuild: isDev,
  nodeModulesTransform: {
    type: isDev ? 'none' : 'all'
  },
  targets: {
    ie: 11
  },
  polyfill: {
    imports: ['element-remove', 'core-js']
  },
  headScripts: [
    {
      src: 'https://www.googletagmanager.com/gtag/js?id=G-9R6Q9PDGBK'
    },
    {
      content: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-9R6Q9PDGBK');
    `
    },
    {
      src: 'https://cdn.bootcdn.net/ajax/libs/vConsole/3.13.0/vconsole.min.js'
    },
    {
      content: 'var vConsole = new window.VConsole();'
    }
  ],
  styles: [
    `body .__dumi-default-navbar{
      display: none;
    }
    @media screen and (max-width: 400px){
      body .__dumi-default-previewer-demo{
        padding: 40px 10px;
      }
    }`
  ],
  extraBabelPlugins: [
    [
      'babel-plugin-import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true
      }
    ]
  ]
});
