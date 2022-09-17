import React from 'react';
import classnames from 'classnames';
import { prefixCls } from '../utils';
import '../style';
import './index.less';

const currentPrefixCls = `${prefixCls}-button`;

export interface SliderButtonProps extends React.HTMLAttributes<HTMLSpanElement> {
  disabled?: boolean;
  active?: boolean;
  success?: boolean;
  error?: boolean;
  verify?: boolean;
  mobile?: boolean; // 如果是移动端，去掉 hover 样式
}

const SliderButton = React.forwardRef<HTMLSpanElement, SliderButtonProps>(
  ({ className, disabled, active, success, error, verify, mobile, ...restProps }, ref) => {
    return (
      <span
        className={classnames(currentPrefixCls, className, {
          [`${currentPrefixCls}-disabled`]: disabled,
          [`${currentPrefixCls}-active`]: active,
          [`${currentPrefixCls}-verify`]: verify,
          [`${currentPrefixCls}-success`]: success,
          [`${currentPrefixCls}-error`]: error,
          [`${currentPrefixCls}-pc`]: !mobile,
        })}
        ref={ref}
        {...restProps}
      />
    );
  },
);

SliderButton.displayName = 'SliderButton';

export default SliderButton;
