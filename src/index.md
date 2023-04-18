---
title: 滑块验证码
sidemenu: false
---

# rc-slider-captcha

[![npm][npm]][npm-url] ![GitHub](https://img.shields.io/github/license/caijf/rc-slider-captcha.svg) [![GitHub Star][github-star]][github-url]

React 滑块验证码组件。

## 特性

- 简单易用
- 适配 PC 和 移动端
- 兼容 IE11 和现代浏览器
- 使用 TypeScript 开发，提供完整的类型定义文件

## 代码演示

<code src='./demos/dev-icon.tsx' />
<code src='./demos/dev-button.tsx' />
<code src='./demos/dev-slideway.tsx' />

### 基础用法

只需传入 `request` 和 `onVerify` 。

`request` 异步返回背景图和滑块图。 `onVerify` 用户滑动停止时触发，用于验证。

<code src='./demos/basic.tsx' />

### 触发式

<code src='./demos/float.tsx' />

**触发式交互说明：**

- PC 端：鼠标移入时显示拼图，移出隐藏拼图。
- 移动端：触摸滑块显示拼图，停止触摸后，如果有向右滑动过则验证后隐藏拼图，否则隐藏拼图。

**注意，验证成功后，PC 端和移动端都会隐藏拼图，且不再显示。假如后面提交时验证码失效，可以通过手动触发刷新。**

### 手动刷新

<code src='./demos/actionRef.tsx' />

### 自定义尺寸

**什么情况下需要自定义尺寸？**

1. 背景图`宽度`不等于 `320` 或`高度`不等于 `160`
2. 拼图`宽度`不等于 `60` 或高度不等于背景图高度，需要调整 `left` 、 `top`

<code src='./demos/size.tsx' />
<code src='./demos/size2.tsx' />

### 自定义样式

<code src='./demos/custom-style.tsx' />

### 验证失败处理

一、验证失败不自动刷新，需要手动点击刷新图标 或 手动调用刷新方法

<code src='./demos/error.tsx' />

二、连续验证失败超过限制次数，需要手动点击刷新

<code src='./demos/errors.tsx' />

### 验证成功提示

自定义拼图内容，验证成功后显示“多少秒完成，打败了多少用户”。

<code src='./demos/custom-content.tsx' />

### 结合弹窗

<code src='./demos/modal.tsx' />

### 客户端生成拼图

> [拼图生成器](https://caijf.github.io/create-puzzle/index.html#/generator)

<code src='./demos/create-puzzle.tsx' />

## API

### SliderCaptcha

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| request | 请求背景图和拼图 | `() => Promise<{ bgUrl:string; puzzleUrl:string;}>` | - |
| onVerify | 用户操作滑块完成后触发，主要用于验证，返回 `resolve` 表示验证成功，`reject` 表示验证失败。 | `(data: VerifyParam) => Promise<any>` | - |
| mode | 显示模式。`embed` - 嵌入式， `float` - 触发式。 | `'embed' \| 'float'` | `'embed'` |
| bgSize | 背景图尺寸 | `{ width: number; height: number; }` | `{ width: 320, height: 160 }` |
| puzzleSize | 拼图尺寸和偏移调整，默认宽度 `60`，高度为背景图高度。 | `{ width: number; height: number; left: number; top: number; }` | `{ width: 60 }` |
| tipText | 提示文本配置 | `{ default: ReactNode; loading: ReactNode; errors: ReactNode; }` | - |
| tipIcon | 提示图标配置 | `{ default: ReactNode; loading: ReactNode; error: ReactNode; success: ReactNode; refresh: ReactNode; }` | - |
| actionRef | 常用操作 | `React.MutableRefObject<ActionType \| undefined>;` | - |
| showRefreshIcon | 显示右上角刷新图标 | `boolean` | `true` |
| limitErrorCount | 限制连续错误次数。当连续错误次数达到限制时，不允许操作滑块和刷新图标，必须手动点击操作条刷新。`0` 表示不限制错误次数。 | `number` | `0` |
| jigsawContent | 拼图区域自定义内容，需要自己定义绝对定位和 zIndex 。 | `ReactNode` | - |
| loadingBoxProps | 拼图区域加载配置，支持 div 属性。 | `{ icon: ReactNode; text: ReactNode }` | - |
| autoRequest | 自动发起请求 | `boolean` | `true` |
| autoRefreshOnError | 验证失败后自动刷新 | `boolean` | `true` |
| errorHoldDuration | 错误停留多少毫秒后自动刷新，仅在 `autoRefreshOnError=true` 时生效。 | `number` | `500` |
| placement | 浮层位置，触发式下生效 | `'top' \| 'bottom'` | `'top'` |
| className | 类名 | `string` | - |
| style | 样式 | `CSSProperties` | - |

> 连续错误次数说明：当用户操作滑块验证成功后，将重置连续错误次数为 0 。当用户点击限制错误次数操作条刷新时也将错误次数重置为 0 。

### VerifyParam

```typescript
type VerifyParam = {
  x: number; // 拼图 x 轴移动值（拼图和滑块按钮可移动距离不一样，这里的移动距离是计算后的拼图移动距离。）
  y: number; // y 轴移动值（按下鼠标到释放鼠标 y 轴的差值）
  sliderOffsetX: number; // 滑块 x 轴偏移值（暂时没有什么场景会用到）
  duration: number; // 操作持续时长
  trail: [number, number][]; // 移动轨迹
  targetType: 'puzzle' | 'button'; // 操作dom目标 puzzle-拼图 button-滑块按钮
  errorCount: number; // 连续错误次数
};
```

如果对安全比较重视的，可以通过 `y` `duration` `trail` 等结合算法判断是否人为操作，防止一些非人为操作破解滑块验证码。

大部分情况下，只需要将 `x` 传给后端即可（如果背景图和滑块有比例缩放，可能需要自己计算 `x 乘以 缩放比例`）。

### actionRef

提供给外部的操作，便于一些特殊场景自定义。

```typescript
export type ActionType = {
  refresh: (resetErrorCount?: boolean) => void; // 刷新，参数为是否重置连续错误次数为0
  status: Status; // 每次获取返回当前的状态，注意它不是引用值，而是一个静态值。部分场景下配合自定义刷新操作使用。
};

export enum Status {
  Default = 1, // 默认
  Loading, // 加载中
  Moving, // 移动中
  Verify, // 验证中
  Success, // 验证成功
  Error // 验证失败
}
```

### CSS 变量

| 变量名 | 说明 | 默认值 |
| --- | --- | --- |
| --rcsc-primary | 主色 | `#1991fa` <span style="display: inline-block; width: 16px; height: 16px; background: #1991fa; border-radius: 2px; vertical-align: middle; margin: 0 4px;"></span> |
| --rcsc-primary-light | 主色-浅 | `#d1e9fe` <span style="display: inline-block; width: 16px; height: 16px; background: #d1e9fe; border-radius: 2px; vertical-align: middle; margin: 0 4px;"></span> |
| --rcsc-error | 错误色 | `#f57a7a` <span style="display: inline-block; width: 16px; height: 16px; background: #f57a7a; border-radius: 2px; vertical-align: middle; margin: 0 4px;"></span> |
| --rcsc-error-light | 错误色-浅 | `#fce1e1` <span style="display: inline-block; width: 16px; height: 16px; background: #fce1e1; border-radius: 2px; vertical-align: middle; margin: 0 4px;"></span> |
| --rcsc-success | 成功色 | `#52ccba` <span style="display: inline-block; width: 16px; height: 16px; background: #52ccba; border-radius: 2px; vertical-align: middle; margin: 0 4px;"></span> |
| --rcsc-success-light | 成功色-浅 | `#d2f4ef` <span style="display: inline-block; width: 16px; height: 16px; background: #d2f4ef; border-radius: 2px; vertical-align: middle; margin: 0 4px;"></span> |
| --rcsc-border-color | 边框色 | `#e4e7eb` <span style="display: inline-block; width: 16px; height: 16px; background: #e4e7eb; border-radius: 2px; vertical-align: middle; margin: 0 4px;"></span> |
| --rcsc-bg-color | 背景色 | `#f7f9fa` <span style="display: inline-block; width: 16px; height: 16px; background: #f7f9fa; border-radius: 2px; vertical-align: middle; margin: 0 4px;"></span> |
| --rcsc-text-color | 文本色 | `#45494c` <span style="display: inline-block; width: 16px; height: 16px; background: #45494c; border-radius: 2px; vertical-align: middle; margin: 0 4px;"></span> |

> \* 注意 IE11 不支持 css 变量，如果你的项目需要兼容 IE11，尽量不使用 css 变量改变样式。

[npm]: https://img.shields.io/npm/v/rc-slider-captcha.svg
[npm-url]: https://npmjs.com/package/rc-slider-captcha
[github-star]: https://img.shields.io/github/stars/caijf/rc-slider-captcha?style=social
[github-url]: https://github.com/caijf/rc-slider-captcha
