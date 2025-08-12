---
toc: content
---

# rc-slider-captcha

[![npm][npm]][npm-url] ![GitHub](https://img.shields.io/github/license/caijf/rc-slider-captcha.svg) [![GitHub Star][github-star]][github-url]

React 滑块验证码组件。

## 特性

- 简单易用
- 适配 PC 和移动端
- 兼容 IE11 和现代浏览器
- 使用 TypeScript 开发，提供完整的类型定义文件

## 代码演示

<!-- 图标 -->

<code src='../src/demos/dev-icon.tsx'></code>

<!-- 按钮 -->

<code src='../src/demos/dev-button.tsx'></code>

<!-- 滑轨 -->

<code src='../src/demos/dev-control-bar.tsx'></code>

<!-- 拼图 -->

<code src='../src/demos/dev-jigsaw.tsx'></code>

### 基础用法

只需传入 `request` 和 `onVerify` 。

`request` 异步返回背景图和滑块图。

`onVerify` 用户移动停止时触发，用于验证。参数 [VerifyParam](#verifyparam) 一般情况下只需要用到拼图 `x` 轴偏移值。

<code src='../src/demos/basic.tsx'></code>

### 触发式

设置 `mode="float"`。

<code src='../src/demos/float.tsx'></code>

> **触发式交互说明：**
>
> - PC 端：鼠标移入时显示拼图，移出隐藏拼图。如果 `showJigsawOnActive` 为 `true`，在移动中或验证中始终显示拼图，验证完成且鼠标移出隐藏拼图。
> - 移动端：触摸滑块显示拼图，停止触摸后，如果有向右移动过则触发验证后隐藏拼图，否则直接隐藏拼图。
>
> **注意，验证成功后，PC 端和移动端都会隐藏拼图，且不再显示。假如后面提交时验证码失效，可以通过手动触发刷新。**

### 纯滑块，无拼图

设置 `mode="slider"` 无需 `request` 。你也可以自定义宽度、结合移动轨迹，做人机校验识别。

<code src='../src/demos/slider.tsx'></code>

宽度自适应

<code src='../src/demos/slider-full-width.tsx'></code>

### 手动刷新

假如验证成功之后，等一段时间再去提交表单，服务返回验证码失效。这时候可以通过主动刷新滑块验证码，并提示用户重新验证。

<code src='../src/demos/actionRef.tsx'></code>

### 自定义尺寸

**什么情况下需要自定义尺寸？**

1. 背景图`宽度`不等于`320`或`高度`不等于`160`
2. 拼图`宽度`不等于`60` 或`高度`不等于背景图高度，需要调整`left`、`top`

<code src='../src/demos/size.tsx'></code>

<code src='../src/demos/size2.tsx'></code>

### 自定义样式

<code src='../src/demos/custom-style.tsx'></code>

<!-- 自定义样式2 -->

<code src='../src/demos/custom-styles.tsx'></code>

<!-- 自定义滑轨高度 -->

<code src='../src/demos/custom-height.tsx'></code>

暗色主题

<code src='../src/demos/custom-dark.tsx' background="#000"></code>

### 自定义文本

<code src='../src/demos/custom-intl.tsx'></code>

### 请求失败

当图片接口请求失败时，友好显示。

<code src='../src/demos/request-failed.tsx'></code>

### 验证失败处理

一、验证失败不自动刷新，需要手动点击刷新图标 或 手动调用刷新方法

设置 `autoRefreshOnError={false}` 。如果验证失败需要外部手动刷新 或 用户点击刷新图标。

<code src='../src/demos/error.tsx'></code>

二、连续验证失败超过限制次数，需要手动点击刷新

当连续失败3次后，需要点击滑块控制条才能刷新。

<code src='../src/demos/errors.tsx'></code>

### 验证成功提示

自定义拼图内容，验证成功后显示“多少秒完成，打败了多少用户”。

<code src='../src/demos/custom-content.tsx'></code>

### 结合弹窗

点击登录按钮显示滑块验证码弹窗，你可以在 `onVerify` 成功之后进行页面跳转或其他操作。

<code src='../src/demos/modal.tsx'></code>

### 客户端生成拼图

> 使用 [create-puzzle](https://caijf.github.io/create-puzzle/) 生成背景图和拼图。如果你使用的是 Node.js 做服务端，推荐使用 [node-puzzle](https://github.com/caijf/node-puzzle) 。

<code src='../src/demos/create-puzzle.tsx'></code>

## API

<embed src="../README.md#L60-L1000"></embed>

[npm]: https://img.shields.io/npm/v/rc-slider-captcha.svg
[npm-url]: https://npmjs.com/package/rc-slider-captcha
[github-star]: https://img.shields.io/github/stars/caijf/rc-slider-captcha?style=social
[github-url]: https://github.com/caijf/rc-slider-captcha
