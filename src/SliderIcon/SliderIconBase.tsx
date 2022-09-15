import React from 'react';
import classnames from 'classnames';
import { prefixCls } from '../config';

const currentPrefixCls = `${prefixCls}-icon`;

export interface SliderIconBaseProps extends React.HTMLAttributes<HTMLSpanElement> {
  spin?: boolean;
}

const SliderIconBase: React.FC<SliderIconBaseProps> = ({ className, spin, ...restProps }) => {
  return (
    <span
      className={classnames(currentPrefixCls, { [`${currentPrefixCls}-spin`]: spin }, className)}
      {...restProps}
    />
  );
};

export default SliderIconBase;
