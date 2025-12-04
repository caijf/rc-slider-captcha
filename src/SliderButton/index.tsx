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
  buttonRef?: React.RefObject<HTMLSpanElement | null>;
}

const SliderButton: React.FC<SliderButtonProps> = ({
  className,
  disabled,
  active,
  success,
  error,
  verify,
  buttonRef,
  ...restProps
}) => (
  <span
    className={classnames(currentPrefixCls, className, {
      [`${currentPrefixCls}-disabled`]: disabled,
      [`${currentPrefixCls}-active`]: active,
      [`${currentPrefixCls}-verify`]: verify,
      [`${currentPrefixCls}-success`]: success,
      [`${currentPrefixCls}-error`]: error,
      [`${currentPrefixCls}-pc`]: !isSupportTouch // 如果是移动端，去掉 hover 样式
    })}
    ref={buttonRef as React.RefObject<HTMLSpanElement>}
    {...restProps}
  />
);

SliderButton.displayName = 'SliderButton';

export default SliderButton;
