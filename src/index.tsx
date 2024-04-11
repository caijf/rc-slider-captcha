import classnames from 'classnames';
import React, { ReactNode, useEffect, useMemo, useRef } from 'react';
import { useSafeState, useLatest } from 'rc-hooks';
import './style';
import LoadingBox, { LoadingBoxProps } from './LoadingBox';
import SliderButton, { SliderButtonProps } from './SliderButton';
import SliderIcon from './SliderIcon';
import { getClient, isBrowser, isSupportTouch, prefixCls, reflow, setStyle } from './utils';

type TipTextType = {
  default: ReactNode;
  loading: ReactNode;
  moving: ReactNode;
  verifying: ReactNode;
  success: ReactNode;
  error: ReactNode;
  errors: ReactNode;
};

type TipIconType = {
  default: ReactNode;
  loading: ReactNode;
  error: ReactNode;
  success: ReactNode;
  refresh: ReactNode;
};

type SizeType = {
  width: number;
  height: number;
  top: number;
  left: number;
};

type JigsawImages = {
  bgUrl: string; // 背景图
  puzzleUrl: string; // 拼图
};

export enum CurrentTargetType {
  Puzzle = 'puzzle',
  Button = 'button'
}

export type VerifyParam = {
  x: number; // 拼图 x轴移动值
  y: number; // y 轴移动值
  sliderOffsetX: number; // 滑块 x轴偏移值
  duration: number; // 操作持续时长
  trail: [number, number][]; // 移动轨迹
  targetType: CurrentTargetType; // 操作dom目标
  errorCount: number; // 期间连续错误次数
};

// 内部状态
export enum Status {
  Default = 1,
  Loading,
  Moving,
  Verify,
  Success,
  Error
}

// 常用操作
export type ActionType = {
  refresh: (resetErrorCount?: boolean) => void; // 刷新，参数为是否重置连续错误次数为0
  status: Status; // 每次获取返回当前的状态，注意它不是引用值，而是一个静态值。部分场景下配合自定义刷新操作使用。
};

export type SliderCaptchaProps = {
  limitErrorCount?: number; // 限制连续错误次数
  onVerify: (data: VerifyParam) => Promise<any>; // 移动松开后触发验证方法
  tipText?: Partial<TipTextType>; // 提示文本
  tipIcon?: Partial<TipIconType>; // 提示图标
  bgSize?: Partial<Pick<SizeType, 'width' | 'height'>>; // 背景图片尺寸
  puzzleSize?: Partial<SizeType>; // 拼图尺寸和偏移调整
  autoRequest?: boolean; // 自动发起请求
  autoRefreshOnError?: boolean; // 验证失败后自动刷新
  actionRef?: React.MutableRefObject<ActionType | undefined>; // 常用操作
  showRefreshIcon?: boolean; // 显示右上角刷新图标
  jigsawContent?: React.ReactNode; // 面板内容，如xx秒完成超过多少用户；或隐藏刷新图标，自定义右上角内容。
  errorHoldDuration?: number; // 错误停留时长，仅在 autoRefreshOnError = true 时生效
  loadingDelay?: number; // 延迟加载状态
  placement?: 'top' | 'bottom'; // 触发式的浮层位置
  loadingBoxProps?: LoadingBoxProps;
  sliderButtonProps?: SliderButtonProps;
  className?: string;
  style?: React.CSSProperties;
  styles?: {
    panel?: React.CSSProperties;
    jigsaw?: React.CSSProperties;
    bgImg?: React.CSSProperties;
    puzzleImg?: React.CSSProperties;
    control?: React.CSSProperties;
    indicator?: React.CSSProperties;
  };
} & (
  | {
      mode?: 'embed' | 'float'; // 模式，embed-嵌入式 float-触发式 slider-只有滑块无拼图，默认为 embed 。
      request: () => Promise<JigsawImages>; // 请求背景图和拼图
    }
  | {
      mode: 'slider'; // 纯滑块不需要传入 request 。
      request?: () => Promise<JigsawImages>; // 请求背景图和拼图
    }
);

const controlPrefixCls = `${prefixCls}-control`;
const jigsawPrefixCls = `${prefixCls}-jigsaw`;

const SliderButtonWidth = 40; // 滑块按钮宽度
const SliderBorderWidth = 2; // 滑块边框宽度

// 默认配置
const defaultConfig = {
  bgSize: {
    width: 320,
    height: 160
  },
  puzzleSize: {
    width: 60,
    left: 0
  },
  tipText: {
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
    )
  } as TipTextType,
  tipIcon: {
    default: <SliderIcon type="arrowRight" />,
    loading: <SliderIcon type="loading" spin />,
    error: <SliderIcon type="x" />,
    success: <SliderIcon type="check" />,
    refresh: <SliderIcon type="refresh" />
  } as TipIconType
};

const events = isSupportTouch
  ? {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend'
    }
  : {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup'
    };

const SliderCaptcha: React.FC<SliderCaptchaProps> = ({
  mode: outMode = 'embed',
  limitErrorCount = 0,
  tipText: outTipText,
  tipIcon: outTipIcon,
  bgSize: outBgSize,
  puzzleSize: outPuzzleSize,
  request,
  autoRequest = true,
  onVerify,
  autoRefreshOnError = true,
  actionRef,
  showRefreshIcon = true,
  jigsawContent,
  errorHoldDuration = 500,
  loadingDelay = 0,
  placement = 'top',
  loadingBoxProps,
  sliderButtonProps,
  className,
  style,
  styles
}) => {
  const [jigsawImgs, setJigsawImgs] = useSafeState<JigsawImages>();
  const [status, setStatus] = useSafeState<Status>(Status.Default);
  const latestStatus = useLatest(status); // 同步status值，提供给事件方法使用
  const loadingTimerRef = useRef<any>(null); // 延迟加载状态定时器
  const hasLoadingDelay = typeof loadingDelay === 'number' && loadingDelay > 0;

  // dom ref
  const sliderButtonRef = useRef<HTMLSpanElement>(null);
  const puzzleRef = useRef<HTMLImageElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // config
  const mode = useMemo(
    () => (outMode === 'float' || outMode === 'slider' ? outMode : 'embed'),
    [outMode]
  ); // 模式
  const modeIsSlider = mode === 'slider';
  const tipText = useMemo(() => ({ ...defaultConfig.tipText, ...outTipText }), [outTipText]);
  const tipIcon = useMemo(() => ({ ...defaultConfig.tipIcon, ...outTipIcon }), [outTipIcon]);
  const bgSize = useMemo(() => ({ ...defaultConfig.bgSize, ...outBgSize }), [outBgSize]);
  const puzzleSize = useMemo(
    () => ({ ...defaultConfig.puzzleSize, ...outPuzzleSize }),
    [outPuzzleSize]
  );
  const placementPos = useMemo(() => (placement === 'bottom' ? 'top' : 'bottom'), [placement]);

  const currentTargetTypeRef = useRef<CurrentTargetType>(CurrentTargetType.Button); // 当前触发事件的节点，拼图或按钮
  const errorCountRef = useRef(0); // 连续错误次数
  const startInfoRef = useRef({ x: 0, y: 0, timestamp: 0 }); // 鼠标按下或触摸开始信息
  const trailRef = useRef([] as [number, number][]); // 移动轨迹
  const isPressedRef = useRef(false); // 标识是否按下
  const sliderButtonWidthRef = useRef(SliderButtonWidth); // 滑块按钮宽度

  const floatTransitionTimerRef = useRef<any>(null); // 触发式渐变过渡效果定时器
  const floatDelayShowTimerRef = useRef<any>(null); // 触发式鼠标移入定时器
  const floatDelayHideTimerRef = useRef<any>(null); // 触发式鼠标移出定时器
  const refreshTimerRef = useRef<any>(null); // 自动刷新的定时器
  const isLimitErrors =
    latestStatus.current === Status.Error &&
    limitErrorCount > 0 &&
    errorCountRef.current >= limitErrorCount; // 是否超过限制错误次数

  const ratioRef = useRef(1); // 当滑块或拼图为触发事件的焦点时，两者的变换比例
  const maxDistanceRef = useRef({ button: 0, puzzle: 0 }); // 最大可移动距离
  // 更新最大可移动距离
  const updateMaxDistance = () => {
    maxDistanceRef.current.button = bgSize.width - sliderButtonWidthRef.current - SliderBorderWidth;
    maxDistanceRef.current.puzzle = bgSize.width - puzzleSize.width - puzzleSize.left;
  };

  // 获取背景图和拼图
  const getJigsawImages = async () => {
    if (modeIsSlider) return;
    if (request) {
      if (hasLoadingDelay) {
        loadingTimerRef.current = setTimeout(() => {
          setStatus(Status.Loading);
        }, loadingDelay);
      } else {
        setStatus(Status.Loading);
      }

      const result = await request();

      if (hasLoadingDelay) {
        clearTimeout(loadingTimerRef.current);
      }

      setJigsawImgs(result);
      setStatus(Status.Default);
    }
  };

  // 触发式下，显示面板
  const showPanel = (delay = 300) => {
    if (mode !== 'float' || latestStatus.current === Status.Success) {
      return;
    }

    clearTimeout(floatTransitionTimerRef.current);
    clearTimeout(floatDelayHideTimerRef.current);
    clearTimeout(floatDelayShowTimerRef.current);

    floatDelayShowTimerRef.current = setTimeout(() => {
      setStyle(panelRef.current, { display: 'block' });
      reflow(panelRef.current);
      setStyle(panelRef.current, { [placementPos]: '42px', opacity: '1' });
    }, delay);
  };

  // 触发式下，隐藏面板
  const hidePanel = (delay = 300) => {
    if (mode !== 'float') {
      return;
    }

    clearTimeout(floatTransitionTimerRef.current);
    clearTimeout(floatDelayHideTimerRef.current);
    clearTimeout(floatDelayShowTimerRef.current);

    floatDelayHideTimerRef.current = setTimeout(() => {
      setStyle(panelRef.current, { [placementPos]: '22px', opacity: '0' });
      floatTransitionTimerRef.current = setTimeout(() => {
        setStyle(panelRef.current, { display: 'none' });
      }, 300);
    }, delay);
  };

  // 重置状态和元素位置
  const reset = () => {
    isPressedRef.current = false;
    // isMovedRef.current = false;
    setStatus(Status.Default);

    setStyle(sliderButtonRef.current, { left: '0' });
    setStyle(indicatorRef.current, { width: '0' });
    setStyle(puzzleRef.current, { left: puzzleSize.left + 'px' });
  };

  // 刷新
  const refresh = (resetErrorCount = false) => {
    // 重置连续错误次数记录
    if (resetErrorCount) {
      errorCountRef.current = 0;
    }

    // 清除延迟调用刷新方法的定时器
    clearTimeout(refreshTimerRef.current);

    // 防止连续调用刷新方法，会触发多次请求的问题
    if (latestStatus.current === Status.Loading) {
      return;
    }

    reset();
    getJigsawImages();
  };

  // 点击滑块操作条，如果连续超过错误次数则刷新
  const handleClickControl = () => {
    if (isLimitErrors) {
      refresh(true);
    }
  };

  // 鼠标移入显示面板，如果支持touch事件不处理
  const handleMouseEnter = () => {
    if (isSupportTouch) {
      return;
    }
    showPanel();
  };

  // 鼠标移出隐藏面板，如果支持touch事件不处理
  const handleMouseLeave = () => {
    if (isSupportTouch) {
      return;
    }
    hidePanel();
  };

  // 点击刷新图标
  const handleClickRefreshIcon = () => {
    if (status !== Status.Verify && !isLimitErrors) {
      refresh();
    }
  };

  // 鼠标按下或触摸开始
  const touchstart = (e: any) => {
    if (latestStatus.current !== Status.Default) {
      return;
    }

    e.preventDefault(); // 防止移动端按下后会选择文本或图片

    const target = e.currentTarget as HTMLElement; // 用于判断当前触发事件的节点

    if (target && sliderButtonRef.current && (modeIsSlider || puzzleRef.current)) {
      const { clientX, clientY } = getClient(e);

      startInfoRef.current = {
        x: clientX,
        y: clientY,
        timestamp: new Date().getTime()
      };
      trailRef.current = [[startInfoRef.current.x, startInfoRef.current.y]];

      sliderButtonWidthRef.current = sliderButtonRef.current.clientWidth;
      updateMaxDistance();
      currentTargetTypeRef.current = target.getAttribute('data-id') as CurrentTargetType;

      // 最大可移动区间值比例
      ratioRef.current = maxDistanceRef.current.puzzle / maxDistanceRef.current.button;
      if (currentTargetTypeRef.current === CurrentTargetType.Puzzle) {
        ratioRef.current = 1 / ratioRef.current;
      }

      // 处理移动端-触发式兼容
      if (isSupportTouch) {
        showPanel(0);
      }

      isPressedRef.current = true;

      document.addEventListener(events.move, touchmove);
      document.addEventListener(events.end, touchend);
      document.addEventListener('touchcancel', touchend);
    }
  };

  // 鼠标移动 或 触摸移动
  const touchmove = (e: any) => {
    if (!isPressedRef.current) {
      return;
    }

    e.preventDefault();
    const { clientX, clientY } = getClient(e);

    let diffX = clientX - startInfoRef.current.x; // 移动距离
    trailRef.current.push([clientX, clientY]); // 记录移动轨迹

    if (latestStatus.current !== Status.Moving && diffX > 0) {
      setStatus(Status.Moving);
    }

    let puzzleLeft = diffX; // 拼图左偏移值
    let sliderButtonLeft = diffX; // 滑块按钮左偏移值

    if (currentTargetTypeRef.current === CurrentTargetType.Puzzle) {
      diffX = Math.max(0, Math.min(diffX, maxDistanceRef.current.puzzle));
      puzzleLeft = diffX + puzzleSize.left;
      sliderButtonLeft = diffX * ratioRef.current;
    } else {
      diffX = Math.max(0, Math.min(diffX, maxDistanceRef.current.button));
      sliderButtonLeft = diffX;
      puzzleLeft = diffX * ratioRef.current + puzzleSize.left;
    }

    setStyle(sliderButtonRef.current, { left: sliderButtonLeft + 'px' });
    setStyle(indicatorRef.current, {
      width: sliderButtonLeft + sliderButtonWidthRef.current + SliderBorderWidth + 'px'
    });
    setStyle(puzzleRef.current, { left: puzzleLeft + 'px' });
  };

  // 鼠标弹起 或 停止触摸
  const touchend = (e: any) => {
    document.removeEventListener(events.move, touchmove);
    document.removeEventListener(events.end, touchend);
    document.removeEventListener('touchcancel', touchend);

    if (!isPressedRef.current) {
      return;
    }

    if (latestStatus.current !== Status.Moving) {
      isPressedRef.current = false;

      // 如果是移动端事件，并且是触发式，隐藏浮层
      if (isSupportTouch) {
        hidePanel();
      }
      return;
    }

    if (onVerify) {
      isPressedRef.current = false;
      setStatus(Status.Verify);

      const endTimestamp = new Date().getTime();
      const { clientX, clientY } = getClient(e);

      const diffY = clientY - startInfoRef.current.y;
      let diffX = clientX - startInfoRef.current.x; // 拼图移动距离
      let sliderOffsetX = diffX; // 滑块偏移值

      if (currentTargetTypeRef.current === CurrentTargetType.Puzzle) {
        diffX = Math.max(0, Math.min(diffX, maxDistanceRef.current.puzzle));
        sliderOffsetX = diffX * ratioRef.current;
      } else {
        diffX = Math.max(0, Math.min(diffX, maxDistanceRef.current.button));
        sliderOffsetX = diffX;
        diffX *= ratioRef.current;
      }

      onVerify({
        x: diffX,
        y: diffY,
        sliderOffsetX,
        duration: endTimestamp - startInfoRef.current.timestamp,
        trail: trailRef.current,
        targetType: currentTargetTypeRef.current,
        errorCount: errorCountRef.current
      })
        .then(() => {
          errorCountRef.current = 0;
          setStatus(Status.Success);
          hidePanel();
        })
        .catch(() => {
          errorCountRef.current += 1;
          setStatus(Status.Error);

          if (isSupportTouch) {
            hidePanel();
          }

          if (
            (limitErrorCount <= 0 || errorCountRef.current < limitErrorCount) &&
            autoRefreshOnError
          ) {
            refreshTimerRef.current = setTimeout(() => {
              refresh();
            }, errorHoldDuration);
          }
        });
    } else {
      reset();
    }
  };

  useEffect(() => {
    if (autoRequest) {
      getJigsawImages();
    }

    const sliderButtonTarget = sliderButtonRef.current;
    const puzzleTarget = puzzleRef.current;

    if (isBrowser && sliderButtonTarget) {
      sliderButtonTarget.addEventListener(events.start, touchstart);
      puzzleTarget && puzzleTarget.addEventListener(events.start, touchstart);

      return () => {
        sliderButtonTarget.removeEventListener(events.start, touchstart);
        puzzleTarget && puzzleTarget.removeEventListener(events.start, touchstart);
        document.removeEventListener(events.move, touchmove);
        document.removeEventListener(events.end, touchend);
        document.removeEventListener('touchcancel', touchend);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = status === Status.Loading; // 加载中
  const isStop = status === Status.Verify || status === Status.Error || status === Status.Success; // 是否停止滑动

  // 当前提示文本
  const currentTipText = useMemo(() => {
    if (status === Status.Default) {
      return tipText.default;
    }
    if (status === Status.Loading) {
      return tipText.loading;
    }
    if (status === Status.Moving) {
      return tipText.moving;
    }
    if (status === Status.Verify) {
      return tipText.verifying;
    }
    if (isLimitErrors) {
      return tipText.errors;
    }
    if (status === Status.Error) {
      return tipText.error;
    }
    if (status === Status.Success) {
      return tipText.success;
    }
    return null;
  }, [status, tipText, isLimitErrors]);

  // 当前提示图标
  const currentTipIcon = useMemo(() => {
    if (status === Status.Success) {
      return tipIcon.success;
    }
    if (status === Status.Error) {
      return tipIcon.error;
    }
    if (status === Status.Verify) {
      return tipIcon.loading;
    }
    return tipIcon.default;
  }, [status, tipIcon]);

  // 提供给外部
  React.useImperativeHandle(actionRef, () => ({
    refresh,
    get status() {
      return latestStatus.current;
    }
  }));

  return (
    <div
      className={classnames(prefixCls, className, `${prefixCls}-${mode}`, {
        [`${prefixCls}-${mode}-${placement}`]: mode === 'float'
      })}
      style={{ width: bgSize.width, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {!modeIsSlider && (
        <div className={`${prefixCls}-panel`} ref={panelRef}>
          <div
            className={`${prefixCls}-panel-inner`}
            style={{ ...styles?.panel, height: bgSize.height }}
          >
            <div
              className={classnames(jigsawPrefixCls, { [`${jigsawPrefixCls}-stop`]: isStop })}
              style={{
                ...styles?.jigsaw,
                ...bgSize,
                ...(loading || !jigsawImgs?.bgUrl ? { display: 'none' } : {})
              }}
            >
              <img
                className={`${jigsawPrefixCls}-bg`}
                style={{ ...styles?.bgImg, ...bgSize }}
                src={jigsawImgs?.bgUrl}
                alt=""
              />
              <img
                className={`${jigsawPrefixCls}-puzzle`}
                style={{ ...styles?.puzzleImg, ...puzzleSize }}
                src={jigsawImgs?.puzzleUrl}
                alt=""
                data-id={CurrentTargetType.Puzzle}
                ref={puzzleRef}
              />
              {showRefreshIcon && status !== Status.Success && tipIcon.refresh && (
                <div
                  className={classnames(`${jigsawPrefixCls}-refresh`, {
                    [`${jigsawPrefixCls}-refresh-disabled`]:
                      status === Status.Verify || isLimitErrors
                  })}
                  onClick={handleClickRefreshIcon}
                >
                  {tipIcon.refresh}
                </div>
              )}
              {jigsawContent}
            </div>
            <LoadingBox
              {...loadingBoxProps}
              style={{
                ...loadingBoxProps?.style,
                ...bgSize,
                ...(loading ? {} : { display: 'none' })
              }}
            />
          </div>
        </div>
      )}
      <div
        className={classnames(controlPrefixCls, {
          [`${controlPrefixCls}-loading`]: loading,
          [`${controlPrefixCls}-moving`]: status === Status.Moving,
          [`${controlPrefixCls}-verify`]: status === Status.Verify,
          [`${controlPrefixCls}-success`]: status === Status.Success,
          [`${controlPrefixCls}-error`]: status === Status.Error,
          [`${controlPrefixCls}-errors`]: isLimitErrors
        })}
        onClick={handleClickControl}
        style={styles?.control}
      >
        <div
          className={classnames(`${controlPrefixCls}-indicator`)}
          style={styles?.indicator}
          ref={indicatorRef}
        />
        <SliderButton
          {...sliderButtonProps}
          className={classnames(`${controlPrefixCls}-button`, sliderButtonProps?.className)}
          disabled={loading}
          active={status === Status.Moving}
          verify={status === Status.Verify}
          success={status === Status.Success}
          error={status === Status.Error}
          data-id={CurrentTargetType.Button}
          mobile={isSupportTouch}
          ref={sliderButtonRef}
        >
          {currentTipIcon}
        </SliderButton>
        {currentTipText && (
          <div className={classnames(`${controlPrefixCls}-tips`)}>{currentTipText}</div>
        )}
      </div>
    </div>
  );
};

export default SliderCaptcha;
