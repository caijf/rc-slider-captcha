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
  /**
   * 更新拼图 `left` 值。
   * @param left 样式 `left` 值。
   */
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
  /**
   * @description 状态。
   */
  status?: Status;

  /**
   * @description 背景图片尺寸。
   * @default { width: 320, height: 160 }
   */
  bgSize?: Partial<Pick<SizeType, 'width' | 'height'>>;

  /**
   * @description 拼图尺寸和偏移调整。
   * @default { width: 60, left: 0 }
   */
  puzzleSize?: Partial<SizeType>;

  /**
   * @description 背景图 url 。
   */
  bgUrl?: string;

  /**
   * @description 拼图 url 。
   */
  puzzleUrl?: string;

  /**
   * @description 背景图元素属性。
   */
  bgImgProps?: ImgHTMLAttributes<HTMLImageElement>;

  /**
   * @description 拼图元素属性。
   */
  puzzleImgProps?: ImgHTMLAttributes<HTMLImageElement>;

  /**
   * @description 拼图操作。
   */
  jigsawRef?: Ref<JigsawRefType>;

  /**
   * @description 拼图区域加载配置，支持 div 属性。
   */
  loadingBoxProps?: LoadingBoxProps;

  /**
   * @description 拼图区域加载失败图标。
   * @default <SliderIcon type="imageFill" />
   */
  loadFailedIcon?: ReactNode;
  showRefreshIcon?: boolean; // 显示右上角刷新图标

  /**
   * @description 拼图区域刷新图标。
   * @default <SliderIcon type="refresh" />
   */
  refreshIcon?: ReactNode;

  /**
   * @description 禁止刷新。
   */
  disabledRefresh?: boolean;

  /**
   * @description 点击刷新时触发。
   * @returns
   */
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

  if (status === Status.LoadFailed) {
    return (
      <div className={`${prefixCls}-load-failed`} style={bgSize}>
        {loadFailedIcon}
      </div>
    );
  }

  const isStop = status === Status.Verify || status === Status.Error || status === Status.Success; // 是否停止移动

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
