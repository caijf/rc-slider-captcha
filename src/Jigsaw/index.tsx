import {
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
  Ref,
  useImperativeHandle,
  useRef
} from 'react';
import classnames from 'classnames';
import { Status } from '../interface';
import LoadingBox, { LoadingBoxProps } from './LoadingBox';
import { prefixCls, setStyle } from '../utils';
import '../style';
import React from 'react';
import SliderIcon from '../SliderIcon';

const jigsawPrefixCls = `${prefixCls}-jigsaw`;

type SizeType = {
  width: number;
  height: number;
  top: number;
  left: number;
};

export type JigsawRefType = {
  updateLeft(left: number): void;
};

// 默认配置
export const defaultConfig = {
  bgSize: {
    width: 320,
    height: 160
  },
  puzzleSize: {
    width: 60,
    left: 0
  },
  loadFailedIcon: <SliderIcon type="imageFill" />,
  refreshIcon: <SliderIcon type="refresh" />
};

export interface JigsawProps extends HTMLAttributes<HTMLDivElement> {
  status?: Status;
  bgSize?: Partial<Pick<SizeType, 'width' | 'height'>>; // 背景图片尺寸
  puzzleSize?: Partial<SizeType>; // 拼图尺寸和偏移调整
  bgUrl?: string;
  puzzleUrl?: string;
  bgImgProps?: ImgHTMLAttributes<HTMLImageElement>;
  puzzleImgProps?: ImgHTMLAttributes<HTMLImageElement>;
  jigsawRef?: Ref<JigsawRefType>;

  loadingBoxProps?: LoadingBoxProps;
  loadFailedIcon?: ReactNode;
  showRefreshIcon?: boolean; // 显示右上角刷新图标
  refreshIcon?: ReactNode;
  disabledRefresh?: boolean;
  onRefresh?: () => void;
}

const Jigsaw: React.FC<JigsawProps> = ({
  status,
  bgSize = defaultConfig.bgSize,
  puzzleSize = defaultConfig.puzzleSize,
  bgUrl,
  puzzleUrl,
  bgImgProps,
  puzzleImgProps,
  jigsawRef,

  loadingBoxProps,
  loadFailedIcon = defaultConfig.loadFailedIcon,
  showRefreshIcon = true,
  refreshIcon = defaultConfig.refreshIcon,
  disabledRefresh,
  onRefresh,

  style,
  className,
  children,
  ...restProps
}) => {
  const puzzleRef = useRef<HTMLImageElement>(null);

  useImperativeHandle(jigsawRef, () => ({
    updateLeft(left) {
      setStyle(puzzleRef.current, { left: left + 'px' });
    }
  }));

  if (status === Status.Loading) {
    return (
      <LoadingBox
        {...loadingBoxProps}
        style={{
          ...loadingBoxProps?.style,
          ...bgSize
        }}
      />
    );
  }

  if (status === Status.LoadFailed || !bgUrl || !puzzleUrl) {
    return (
      <div className={`${prefixCls}-load-failed`} style={bgSize}>
        {loadFailedIcon}
      </div>
    );
  }

  const isStop = status === Status.Verify || status === Status.Error || status === Status.Success; // 是否停止滑动

  return (
    <div
      className={classnames(jigsawPrefixCls, { [`${jigsawPrefixCls}-stop`]: isStop }, className)}
      style={{
        ...style,
        ...bgSize
      }}
      {...restProps}
    >
      <img
        src={bgUrl}
        alt=""
        {...bgImgProps}
        className={classnames(`${jigsawPrefixCls}-bg`, bgImgProps?.className)}
        style={{ ...bgImgProps?.style, ...bgSize }}
      />
      <img
        src={puzzleUrl}
        alt=""
        {...puzzleImgProps}
        className={classnames(`${jigsawPrefixCls}-puzzle`, puzzleImgProps?.className)}
        style={{ ...puzzleImgProps?.style, ...puzzleSize }}
        ref={puzzleRef}
      />
      {showRefreshIcon && status !== Status.Success && refreshIcon && (
        <div
          className={classnames(`${jigsawPrefixCls}-refresh`, {
            [`${jigsawPrefixCls}-refresh-disabled`]: status === Status.Verify || disabledRefresh
          })}
          onClick={() => {
            if (status !== Status.Verify && !disabledRefresh) {
              onRefresh?.();
            }
          }}
        >
          {refreshIcon}
        </div>
      )}
      {children}
    </div>
  );
};

export default Jigsaw;
