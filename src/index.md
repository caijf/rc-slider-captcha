---
sidemenu: false
---

# rc-slider-captcha

滑块验证码

## 代码演示

<code src='./demos/icon.tsx' />
<code src='./demos/button.tsx' />
<code src='./demos/slideway.tsx' />

### 基础用法

<code src='./demos/basic.tsx' />

### 触发式

<code src='./demos/float.tsx' />

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

enum Status {
  Default = 1,
  Loading,
  Verify,
  Success,
  Error,
}

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

export type ActionType = {
  refresh: (resetLimitErrors?: boolean) => void;
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
}
```
