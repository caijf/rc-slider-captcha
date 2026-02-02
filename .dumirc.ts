import { defineConfig } from 'dumi';

const isDev = process.env.NODE_ENV === 'development';
const publicPath = isDev ? '/' : '/rc-slider-captcha/';

export default defineConfig({
  themeConfig: {
    name: 'rc-slider-captcha',
    logo: 'https://www.caijf.top/logo.png',
    nav: [],
    prefersColor: {
      default: 'light',
      switch: false
    },
    footer: `<div>
    <div>caijf | Copyright © 2022-present</div>
    <div>Powered by <a href="https://d.umijs.org/" target="_blank">dumi</a></div>
    </div>`
  },
  base: publicPath,
  publicPath,
  favicons: ['https://www.caijf.top/favicon.ico'],
  outputPath: 'docs-dist',
  analytics: {
    ga_v2: 'G-9R6Q9PDGBK'
  },
  // headScripts: [
  //   {
  //     src: 'https://cdn.bootcdn.net/ajax/libs/vConsole/3.13.0/vconsole.min.js'
  //   },
  //   {
  //     content: 'var vConsole = new window.VConsole();'
  //   }
  // ],
  styles: [
    `body .dumi-default-doc-layout {
      background: white;
    }
    body .dumi-default-doc-layout > main{
      padding-top: 24px;
    }
    body .dumi-default-header{
      display: none;
    }
    body .dumi-default-header-left {
      width: auto;
    }
    body .dumi-default-header-menu-btn{
      display: none;
    }
    body .dumi-default-doc-layout > main > .dumi-default-doc-layout-toc-wrapper {
      top: 52px;
    }
    @media screen and (max-width: 400px){
      body .dumi-default-previewer-demo{
        padding: 40px 12px;
      }
      body .dumi-default-doc-layout > main {
        padding: 0 12px;
      }
    }`
  ]
});
