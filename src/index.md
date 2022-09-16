---
sidemenu: false
---

# rc-slider-captcha

滑块验证码

## 代码演示

<code src='./demos/dev-icon.tsx' />
<code src='./demos/dev-button.tsx' />
<code src='./demos/dev-slideway.tsx' />

### 基础用法

只需传入 `request` 和 `onVerify` 。

<code src='./demos/basic.tsx' />

### 触发式

<code src='./demos/float.tsx' />

**触发式交互说明：**

- PC 端：鼠标移入时显示拼图，移出隐藏拼图。
- 移动端：触摸滑块显示拼图，停止触摸后，如果有向右滑动过则验证后隐藏拼图，否则隐藏拼图。

**注意，验证成功后，PC 端和移动端都会隐藏拼图，且不再显示。假如后面提交时验证码失效，可以通过手动触发刷新。**

### 手动触发刷新

嵌入式和触发式都适用。

<code src='./demos/actionRef.tsx' />

### 自定义尺寸

**什么情况下需要自定义尺寸？**

1. 背景图`宽度`不等于 `320` 或`高度`不等于 `160`
2. 拼图`宽度`不等于 `60` 或高度不等于背景图高度，需要调整 `left` 、 `top`

<code src='./demos/size.tsx' />
<code src='./demos/size2.tsx' />

### 自定义图标和文本

<code src='./demos/iconAndText.tsx' />

### 自定义样式

也可以在自定义图标和文本中展示，需要配合 css 变量。

### 验证失败处理

1. 验证失败不自动刷新
2. 连续验证失败超过限制次数，需要手动点击刷新

### 智能检测

为了防止一些爬虫更难破解滑块验证码，通过 `y` `duration` `trail` 结合算法判断是否人为操作。

`onVerify` 回调方法包含了以下参数：

- `x` - 拼图移动距离
- `y` - 按下鼠标到释放鼠标 `y` 轴的差值
- `targetType` - 用户操作的是拼图还是滑块按钮 `puzzle` or `button`
- `duration` - 操作时长
- `trail` - 拖动轨迹

大部分情况下，只需要将 `x` 传给后端即可（如果背景图和滑块有比例缩放，需要计算 `x 乘以 缩放比例`）。

### 自定义拼图内容

多少秒内完成，超过多少用户。

## API

样式支持 css 变量改变主题和尺寸。

需要计算拼图宽度和滑块比例，移动距离以为拼图距离为准。（注意计算可移动长度）

```typescript
type TipTextType = {
  default: ReactNode;
  loading: ReactNode;
  errors: ReactNode;
};

type TipIconType = {
  default: ReactNode;
  loading: ReactNode;
  error: ReactNode;
  success: ReactNode;
  refresh: ReactNode;
};

type SizeType = {
  width: number;
  height: number;
  top: number;
  left: number;
};

type JigsawImages = {
  bgUrl: string; // 背景图
  puzzleUrl: string; // 拼图
};

enum CurrentTargetType {
  Puzzle = 'puzzle',
  Button = 'button',
}

type VerifyParam = {
  x: number; // 拼图 x轴移动值
  y: number; // y 轴移动值
  duration: number; // 操作持续时长
  trail: [number, number][]; // 移动轨迹
  targetType: CurrentTargetType; // 操作dom目标
  errorCount: number; // 期间连续错误次数
};

export enum Status {
  Default = 1,
  Loading,
  Verify,
  Success,
  Error,
}

export type ActionType = {
  refresh: (resetErrorCount?: boolean) => void; // 刷新，参数为是否重置连续错误次数为0
  status: Status; // 每次获取返回当前的状态，注意它不是引用值，而是一个静态值。部分场景下配合自定义刷新操作使用。
};

export interface SliderCaptchaProps {
  mode?: 'embed' | 'float'; // 模式，embed-嵌入式 float-触发式，默认为 embed。
  limitErrorCount?: number; // 限制连续错误次数
  onVerify: (data: VerifyParam) => Promise<any>; // 移动松开后触发验证方法
  tipText?: Partial<TipTextType>;
  tipIcon?: Partial<TipIconType>;
  bgSize?: Partial<Pick<SizeType, 'width' | 'height'>>; // 背景图片尺寸
  puzzleSize?: Partial<SizeType>; // 拼图尺寸和偏移调整
  request: () => Promise<JigsawImages>; // 请求背景图和拼图
  autoRequest?: boolean; // 自动发起请求
  autoRefreshOnError?: boolean; // 验证失败后自动刷新
  actionRef?: React.MutableRefObject<ActionType | undefined>; // 手动操作
  showRefreshIcon?: boolean; // 显示右上角刷新图标
  jigsawContent?: React.ReactNode; // 面板内容，如xx秒完成超过多少用户；或隐藏刷新图标，自定义右上角内容。
  errorHoldDuration?: number; // 错误停留时长，仅在 autoRefreshOnError = true 时生效
  className?: string;
  style?: CSSProperties;
}
```
