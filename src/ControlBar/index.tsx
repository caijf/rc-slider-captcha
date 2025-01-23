import classnames from 'classnames';
import React, {
  FC,
  Ref,
  HTMLAttributes,
  ReactNode,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react';
import SliderButton, { SliderButtonProps } from '../SliderButton';
import { prefixCls, setStyle } from '../utils';
import '../style';
import SliderIcon from '../SliderIcon';
import { Status } from '../interface';

const controlPrefixCls = `${prefixCls}-control`;
const SliderButtonDefaultWidth = 40;
const IndicatorBorderWidth = 2;

export type TipTextType = {
  /**
   * @description 默认状态显示内容。
   * @default '向右拖动滑块填充拼图'
   */
  default: ReactNode;

  /**
   * @description 加载中显示内容。
   * @default '加载中...'
   */
  loading: ReactNode;

  /**
   * @description 用户操作滑块移动中显示内容。
   * @default null
   */
  moving: ReactNode;

  /**
   * @description 用户停止操作验证中显示内容。
   * @default null
   */
  verifying: ReactNode;

  /**
   * @description 验证成功显示内容。
   * @default null
   */
  success: ReactNode;

  /**
   * @description 验证失败显示内容。
   * @default null
   */
  error: ReactNode;

  /**
   * @description 验证失败且连续错误次数超出限制显示内容。
   * @default <SliderIcon type="x" style={{ fontSize: 20 }} /> 失败过多，点击重试
   */
  errors: ReactNode;

  /**
   * @description `request` 请求返回失败显示内容。
   * @default '加载失败，点击重试'
   */
  loadFailed: ReactNode;
};

export type TipIconType = {
  /**
   * @description 默认状态滑轨按钮图标。
   * @default <SliderIcon type="arrowRight" />
   */
  default: ReactNode;

  /**
   * @description 加载中滑轨按钮图标。
   * @default <SliderIcon type="loading" spin />
   */
  loading: ReactNode;

  /**
   * @description 验证失败滑轨提示图标。
   * @default <SliderIcon type="x" />
   */
  error: ReactNode;

  /**
   * @description 验证成功滑轨提示图标。
   * @default <SliderIcon type="check" />
   */
  success: ReactNode;
};

export type ControlBarRefType = {
  getSliderButtonWidth(force?: boolean): number;
  getIndicatorBorderWidth(force?: boolean): number;
  getRect(force?: boolean): DOMRect;
  updateLeft(left: number): void;
};

interface ControlBarProps extends HTMLAttributes<HTMLDivElement> {
  status?: Status;
  isLimitErrors?: boolean;
  tipText?: Partial<TipTextType>; // 提示文本
  tipIcon?: Partial<TipIconType>; // 提示图标
  sliderButtonProps?: SliderButtonProps;
  indicatorProps?: HTMLAttributes<HTMLDivElement>;
  controlRef?: Ref<ControlBarRefType>;
}

const ControlBar: FC<ControlBarProps> = ({
  status = Status.Default,
  isLimitErrors,
  tipText: customTipText,
  tipIcon: customTipIcon,
  sliderButtonProps,
  indicatorProps,
  controlRef,
  ...restProps
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const sliderButtonRef = useRef<HTMLSpanElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const rectRef = useRef<{
    sliderButtonWidth?: number;
    indicatorBorderWidth?: number;
    rect?: DOMRect;
  }>({});

  const tipText = useMemo(
    () => ({
      default: '向右拖动滑块填充拼图',
      loading: '加载中...',
      moving: null,
      verifying: null,
      success: null,
      error: null,
      errors: (
        <>
          <SliderIcon type="x" style={{ fontSize: 20 }} /> 失败过多，点击重试
        </>
      ),
      loadFailed: '加载失败，点击重试',
      ...customTipText
    }),
    [customTipText]
  );
  const tipIcon = useMemo(
    () => ({
      default: <SliderIcon type="arrowRight" />,
      loading: <SliderIcon type="loading" spin />,
      error: <SliderIcon type="x" />,
      success: <SliderIcon type="check" />,
      ...customTipIcon
    }),
    [customTipIcon]
  );
  const statusViewMap = useMemo(
    () => ({
      [Status.Default]: [tipText.default, tipIcon.default],
      [Status.Loading]: [tipText.loading, tipIcon.default],
      [Status.Moving]: [tipText.moving, tipIcon.default],
      [Status.Verify]: [tipText.verifying, tipIcon.loading],
      [Status.Error]: [tipText.error, tipIcon.error],
      [Status.Success]: [tipText.success, tipIcon.success],
      [Status.LoadFailed]: [tipText.loadFailed, tipIcon.default]
    }),
    [tipText, tipIcon]
  );

  const getSliderButtonWidth = (force?: boolean) => {
    if (force || typeof rectRef.current.sliderButtonWidth !== 'number') {
      rectRef.current.sliderButtonWidth =
        sliderButtonRef.current?.clientWidth || SliderButtonDefaultWidth;
    }
    return rectRef.current.sliderButtonWidth!;
  };

  const getIndicatorBorderWidth = (force?: boolean) => {
    if (force || typeof rectRef.current.indicatorBorderWidth !== 'number') {
      if (indicatorRef.current) {
        const indicatorStyles = window.getComputedStyle(indicatorRef.current);
        rectRef.current.indicatorBorderWidth =
          parseInt(indicatorStyles.borderLeftWidth) + parseInt(indicatorStyles.borderRightWidth);
      } else {
        rectRef.current.indicatorBorderWidth = IndicatorBorderWidth;
      }
    }
    return rectRef.current.indicatorBorderWidth!;
  };

  const getRect = (force?: boolean) => {
    if (force || !rectRef.current.rect) {
      if (wrapperRef.current) {
        rectRef.current.rect = wrapperRef.current?.getBoundingClientRect();
      }
    }
    return rectRef.current.rect!;
  };

  useImperativeHandle(
    controlRef,
    () => ({
      getSliderButtonWidth,
      getIndicatorBorderWidth,
      getRect,
      updateLeft(left) {
        const sliderButtonWidth = getSliderButtonWidth();
        const indicatorBorderWidth = getIndicatorBorderWidth();
        setStyle(sliderButtonRef.current, { left: left + 'px' });
        setStyle(indicatorRef.current, {
          width: left + sliderButtonWidth + indicatorBorderWidth + 'px'
        });
      }
    }),
    []
  );

  const isLoading = status === Status.Loading;
  const isMoving = status === Status.Moving;
  const isVerify = status === Status.Verify;
  const isSuccess = status === Status.Success;
  const isError = status === Status.Error;
  const isLoadFailed = status === Status.LoadFailed;

  const currentTipText = isLimitErrors ? tipText.errors : statusViewMap[status][0];

  return (
    <div
      {...restProps}
      className={classnames(
        controlPrefixCls,
        {
          [`${controlPrefixCls}-loading`]: isLoading,
          [`${controlPrefixCls}-moving`]: isMoving,
          [`${controlPrefixCls}-verify`]: isVerify,
          [`${controlPrefixCls}-success`]: isSuccess,
          [`${controlPrefixCls}-error`]: isError,
          [`${controlPrefixCls}-errors`]: isLimitErrors,
          [`${controlPrefixCls}-load-failed`]: isLoadFailed
        },
        restProps.className
      )}
      ref={wrapperRef}
    >
      <div
        {...indicatorProps}
        className={classnames(`${controlPrefixCls}-indicator`, indicatorProps?.className)}
        ref={indicatorRef}
      />
      <SliderButton
        {...sliderButtonProps}
        className={classnames(`${controlPrefixCls}-button`, sliderButtonProps?.className)}
        disabled={isLoading}
        active={isMoving}
        verify={isVerify}
        success={isSuccess}
        error={isError}
        buttonRef={sliderButtonRef}
      >
        {statusViewMap[status][1]}
      </SliderButton>
      <div
        className={classnames(`${controlPrefixCls}-tips`)}
        style={currentTipText ? {} : { display: 'none' }}
      >
        {currentTipText}
      </div>
    </div>
  );
};

export default ControlBar;
