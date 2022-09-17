import './index.less';
import { isBrowser, isSupportTouch } from '../utils';

if (isBrowser && isSupportTouch) {
  // 移动端:active伪类无效的解决方法
  document.body.addEventListener('touchstart', () => {});
}
