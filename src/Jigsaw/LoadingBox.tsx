import classnames from 'classnames';
import React from 'react';
import SliderIcon from '../SliderIcon';
import { prefixCls } from '../utils';
import '../style';

const currentPrefixCls = `${prefixCls}-loading`;

export interface LoadingBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  text?: React.ReactNode;
}

const LoadingBox: React.FC<LoadingBoxProps> = ({
  icon = <SliderIcon type="loading" spin />,
  text = '加载中...',
  className,
  ...restProps
}) => {
  return (
    <div className={classnames(currentPrefixCls, className)} {...restProps}>
      <div className={`${currentPrefixCls}-icon`}>{icon}</div>
      <div className={`${currentPrefixCls}-text`}>{text}</div>
    </div>
  );
};

export default LoadingBox;
