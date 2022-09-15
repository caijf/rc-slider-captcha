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
    clientY: y,
  };
}

// 设置样式
export function setStyle(el: HTMLElement | null, styleName: string, styleValue: string) {
  if (el) {
    el.style[styleName as any] = styleValue;
  }
}

// 当前运行环境是否可以使用 dom
export const isBrowser =
  typeof window !== 'undefined' &&
  typeof document !== 'undefined' &&
  window?.document &&
  window.document?.addEventListener;
