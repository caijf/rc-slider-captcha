// className 前缀
export const prefixCls = 'rc-slider-captcha';

// 获取事件触发客户端坐标
export function getClient(e: any) {
  let x = 0,
    y = 0;
  if (typeof e.clientX === 'number' && typeof e.clientY === 'number') {
    x = e.clientX;
    y = e.clientY;
  } else if (e.touches && e.touches[0]) {
    x = e.touches[0].clientX;
    y = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches[0]) {
    x = e.changedTouches[0].clientX;
    y = e.changedTouches[0].clientY;
  }
  return {
    clientX: x,
    clientY: y
  };
}

// 设置样式
export function setStyle(el: HTMLElement | null, styleObj: Record<string, string> = {}) {
  if (el) {
    for (const prop in styleObj) {
      el.style[prop as any] = styleObj[prop];
    }
  }
}

// 当前运行环境是否可以使用 dom
export const isBrowser =
  typeof window === 'object' &&
  window &&
  typeof document === 'object' &&
  document &&
  window.document === document &&
  !!document.addEventListener;

// 是否支持指针事件
export const isSupportPointer = isBrowser && 'onpointerdown' in window;

// 是否支持Touch事件
// 区分移动端和PC端的事件绑定，移动端也会触发 mouseup mousedown 事件
export const isSupportTouch = isBrowser && 'ontouchstart' in window;

// 触发重绘
export const reflow = (node: HTMLElement | null) => node?.scrollTop;

// 规整化数字精度
export function normalizeNumber(num: number, precision?: number | false) {
  if (
    typeof num === 'number' &&
    !Number.isNaN(num) &&
    typeof precision === 'number' &&
    precision > 0
  ) {
    return Number(num.toFixed(precision));
  }
  return num;
}
