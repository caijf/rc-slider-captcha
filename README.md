# rc-slider-captcha

[![npm][npm]][npm-url] ![GitHub](https://img.shields.io/github/license/caijf/rc-slider-captcha.svg)

React 滑块验证码组件。

[查看示例][site]

## 特性

- 简单易用
- 适配 PC 和 移动端
- 兼容 IE11 和现代浏览器
- 使用 TypeScript 开发，提供完整的类型定义文件

## 安装

```bash
npm install rc-slider-captcha
```

or

```bash
yarn add rc-slider-captcha
```

## 使用

```typescript
import SliderCaptch from 'rc-slider-captcha';

const Demo = () => {
  return (
    <SliderCaptcha
      request={async () => {
        return {
          bgUrl: 'background image url',
          puzzleUrl: 'puzzle image url'
        };
      }}
      onVerify={async (data) => {
        console.log(data);
        // verify data
        return Promise.resolve();
      }}
    />
  );
};
```

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
  Verify, // 验证中
  Success, // 验证成功
  Error // 验证失败
}
```

### CSS 变量

| 变量名               | 说明      | 默认值    |
| -------------------- | --------- | --------- |
| --rcsc-primary       | 主色      | `#1991fa` |
| --rcsc-primary-light | 主色-浅   | `#d1e9fe` |
| --rcsc-error         | 错误色    | `#f57a7a` |
| --rcsc-error-light   | 错误色-浅 | `#fce1e1` |
| --rcsc-success       | 成功色    | `#52ccba` |
| --rcsc-success-light | 成功色-浅 | `#d2f4ef` |
| --rcsc-border-color  | 边框色    | `#e4e7eb` |
| --rcsc-bg-color      | 背景色    | `#f7f9fa` |
| --rcsc-text-color    | 文本色    | `#45494c` |

[site]: https://caijf.github.io/rc-slider-captcha/index.html
[npm]: https://img.shields.io/npm/v/rc-slider-captcha.svg
[npm-url]: https://npmjs.com/package/rc-slider-captcha
