import classnames from 'classnames';
import React from 'react';
import { isSupportTouch, prefixCls } from '../utils';
import '../style';

const currentPrefixCls = `${prefixCls}-button`;

export interface SliderButtonProps extends React.HTMLAttributes<HTMLSpanElement> {
  disabled?: boolean;
  active?: boolean;
  success?: boolean;
  error?: boolean;
  verify?: boolean;
}

const SliderButton = React.forwardRef<HTMLSpanElement, SliderButtonProps>(
  ({ className, disabled, active, success, error, verify, ...restProps }, ref) => {
    return (
      <span
        className={classnames(currentPrefixCls, className, {
          [`${currentPrefixCls}-disabled`]: disabled,
          [`${currentPrefixCls}-active`]: active,
          [`${currentPrefixCls}-verify`]: verify,
          [`${currentPrefixCls}-success`]: success,
          [`${currentPrefixCls}-error`]: error,
          [`${currentPrefixCls}-pc`]: !isSupportTouch // 如果是移动端，去掉 hover 样式
        })}
        ref={ref}
        {...restProps}
      />
    );
  }
);

SliderButton.displayName = 'SliderButton';

export default SliderButton;
