import classnames from 'classnames';
import React, { ReactNode, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useSafeState, useLatest } from 'rc-hooks';
import './style';
import LoadingBox, { LoadingBoxProps } from './LoadingBox';
import { SliderButtonProps } from './SliderButton';
import SliderIcon from './SliderIcon';
import { getClient, isSupportTouch, prefixCls, reflow, setStyle } from './utils';
import ControlBar, { ControlBarRefType, TipIconType, TipTextType } from './ControlBar';
import { Status } from './interface';

type StyleWithVariable<V extends string = never> = React.CSSProperties & Partial<Record<V, string>>;
type StyleProp = StyleWithVariable<
  | '--rcsc-primary'
  | '--rcsc-primary-light'
  | '--rcsc-error'
  | '--rcsc-error-light'
  | '--rcsc-success'
  | '--rcsc-success-light'
  | '--rcsc-border-color'
  | '--rcsc-bg-color'
  | '--rcsc-text-color'
  | '--rcsc-button-color'
  | '--rcsc-button-hover-color'
  | '--rcsc-button-bg-color'
  | '--rcsc-panel-border-radius'
  | '--rcsc-control-border-radius'
>;

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

export { Status };

// 常用操作
export type ActionType = {
  refresh: (resetErrorCount?: boolean) => void; // 刷新，参数为是否重置连续错误次数为0
  status: Status; // 每次获取返回当前的状态，注意它不是引用值，而是一个静态值。部分场景下配合自定义刷新操作使用。
};

export type SliderCaptchaProps = {
  limitErrorCount?: number; // 限制连续错误次数
  onVerify: (data: VerifyParam) => Promise<any>; // 移动松开后触发验证方法
  tipText?: Partial<TipTextType>; // 提示文本
  tipIcon?: Partial<
    TipIconType & {
      /**
       * @deprecated 即将废弃，请使用 `refreshIcon` 。
       */
      refresh: ReactNode;
    }
  >; // 提示图标
  refreshIcon?: ReactNode;
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
  style?: StyleProp;
  styles?: {
    panel?: StyleProp;
    jigsaw?: StyleProp;
    bgImg?: StyleProp;
    puzzleImg?: StyleProp;
    control?: StyleProp;
    indicator?: StyleProp;
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

const jigsawPrefixCls = `${prefixCls}-jigsaw`;

// 默认配置
const defaultConfig = {
  bgSize: {
    width: 320,
    height: 160
  },
  puzzleSize: {
    width: 60,
    left: 0
  }
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
  tipText,
  tipIcon,
  refreshIcon: customRefreshIcon,
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
  const controlRef = useRef<ControlBarRefType>(null);

  // dom ref
  const puzzleRef = useRef<HTMLImageElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // config
  const mode = useMemo(
    () => (outMode === 'float' || outMode === 'slider' ? outMode : 'embed'),
    [outMode]
  );
  const refreshIcon = useMemo(() => {
    if (customRefreshIcon !== undefined) {
      return customRefreshIcon;
    }
    if (tipIcon && tipIcon.refresh !== undefined) {
      return tipIcon.refresh;
    }
    return <SliderIcon type="refresh" />;
  }, [customRefreshIcon, tipIcon]);
  const bgSize = useMemo(() => ({ ...defaultConfig.bgSize, ...outBgSize }), [outBgSize]);
  const puzzleSize = useMemo(
    () => ({ ...defaultConfig.puzzleSize, ...outPuzzleSize }),
    [outPuzzleSize]
  );
  const placementPos = useMemo(() => (placement === 'bottom' ? 'top' : 'bottom'), [placement]);

  const internalRef = useRef({
    isPressed: false, // 标识是否按下
    trail: [] as VerifyParam['trail'], // 移动轨迹
    errorCount: 0, // 连续错误次数
    startInfo: { x: 0, y: 0, timestamp: 0 }, // 鼠标按下或触摸开始信息
    currentTargetType: CurrentTargetType.Button, // 当前触发事件的节点，拼图或按钮

    floatTransitionTimer: null as any, // 触发式渐变过渡效果定时器
    floatDelayShowTimer: null as any, // 触发式鼠标移入定时器
    floatDelayHideTimer: null as any, // 触发式鼠标移出定时器
    refreshTimer: null as any, // 自动刷新的定时器
    loadingTimer: null as any, // 延迟加载状态定时器

    sliderButtonWidth: 40, // 滑块按钮宽度
    indicatorBorderWidth: 2, // 滑轨边框宽度
    ratio: 1, // 当滑块或拼图为触发事件的焦点时，两者的变换比例
    buttonMaxDistance: 0, // 按钮最大可移动距离
    puzzleMaxDistance: 0 // 拼图最大可移动距离
  });

  const modeIsSlider = mode === 'slider'; // 单滑轨，无图片
  const hasLoadingDelay = typeof loadingDelay === 'number' && loadingDelay > 0; // 延迟加载状态
  const isLoading = status === Status.Loading; // 加载中
  const isLoadFailed = status === Status.LoadFailed; // 加载失败
  const isStop = status === Status.Verify || status === Status.Error || status === Status.Success; // 是否停止滑动

  const isLimitErrors =
    status === Status.Error &&
    limitErrorCount > 0 &&
    internalRef.current.errorCount >= limitErrorCount; // 是否超过限制错误次数

  // 更新最大可移动距离
  const updateMaxDistance = () => {
    internalRef.current.buttonMaxDistance =
      bgSize.width -
      internalRef.current.sliderButtonWidth -
      internalRef.current.indicatorBorderWidth;
    internalRef.current.puzzleMaxDistance = bgSize.width - puzzleSize.width - puzzleSize.left;
  };

  // 获取背景图和拼图
  const getJigsawImages = async () => {
    if (modeIsSlider) return;
    if (request) {
      if (hasLoadingDelay) {
        internalRef.current.loadingTimer = setTimeout(() => {
          setStatus(Status.Loading);
        }, loadingDelay);
      } else {
        setStatus(Status.Loading);
      }

      try {
        const result = await request();

        if (hasLoadingDelay) {
          clearTimeout(internalRef.current.loadingTimer);
        }

        setJigsawImgs(result);
        setStatus(Status.Default);
      } catch (err) {
        // console.error(err);
        if (hasLoadingDelay) {
          clearTimeout(internalRef.current.loadingTimer);
        }
        setStatus(Status.LoadFailed);
      }
    }
  };

  // 触发式下，显示面板
  const showPanel = (delay = 300) => {
    if (mode !== 'float' || latestStatus.current === Status.Success) {
      return;
    }

    clearTimeout(internalRef.current.floatTransitionTimer);
    clearTimeout(internalRef.current.floatDelayHideTimer);
    clearTimeout(internalRef.current.floatDelayShowTimer);

    internalRef.current.floatDelayShowTimer = setTimeout(() => {
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

    clearTimeout(internalRef.current.floatTransitionTimer);
    clearTimeout(internalRef.current.floatDelayHideTimer);
    clearTimeout(internalRef.current.floatDelayShowTimer);

    internalRef.current.floatDelayHideTimer = setTimeout(() => {
      setStyle(panelRef.current, { [placementPos]: '22px', opacity: '0' });
      internalRef.current.floatTransitionTimer = setTimeout(() => {
        setStyle(panelRef.current, { display: 'none' });
      }, 300);
    }, delay);
  };

  // 更新拼图位置
  const updatePuzzleLeft = (left: number) => {
    if (!modeIsSlider && puzzleRef.current) {
      setStyle(puzzleRef.current, { left: left + 'px' });
    }
  };

  // 重置状态和元素位置
  const reset = () => {
    internalRef.current.isPressed = false;
    setStatus(Status.Default);

    controlRef.current?.updateLeft(0);
    updatePuzzleLeft(puzzleSize.left);
  };

  // 刷新
  const refresh = (resetErrorCount = false) => {
    // 重置连续错误次数记录
    if (resetErrorCount) {
      internalRef.current.errorCount = 0;
    }

    // 清除延迟调用刷新方法的定时器
    clearTimeout(internalRef.current.refreshTimer);

    // 防止连续调用刷新方法，会触发多次请求的问题
    if (latestStatus.current === Status.Loading) {
      return;
    }

    reset();
    getJigsawImages();
  };

  // 点击滑块操作条，如果连续超过错误次数或请求失败则刷新
  const handleClickControl = () => {
    if (isLimitErrors || isLoadFailed) {
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

  const touchstartPuzzle = (e: any) => {
    internalRef.current.currentTargetType = CurrentTargetType.Puzzle;
    touchstart(e);
  };
  const touchstartSliderButton = (e: any) => {
    internalRef.current.currentTargetType = CurrentTargetType.Button;
    touchstart(e);
  };

  // 鼠标按下或触摸开始
  const touchstart = (e: any) => {
    if (latestStatus.current !== Status.Default) {
      return;
    }

    e.preventDefault(); // 防止移动端按下后会选择文本或图片

    const { clientX, clientY } = getClient(e);

    internalRef.current.startInfo = {
      x: clientX,
      y: clientY,
      timestamp: new Date().getTime()
    };
    internalRef.current.trail = [[clientX, clientY]];

    if (controlRef.current) {
      internalRef.current.sliderButtonWidth = controlRef.current.getSliderButtonWidth(true);
      internalRef.current.indicatorBorderWidth = controlRef.current.getIndicatorBorderWidth(true);
    }
    updateMaxDistance();

    // TODO 改动比例，等大版本更新在调整。
    // if (modeIsSlider) {
    //   internalRef.current.ratio = 1;
    // } else {
    // 最大可移动区间值比例
    internalRef.current.ratio =
      internalRef.current.puzzleMaxDistance / internalRef.current.buttonMaxDistance;
    if (internalRef.current.currentTargetType === CurrentTargetType.Puzzle) {
      internalRef.current.ratio = 1 / internalRef.current.ratio;
    }
    // }

    // 处理移动端-触发式兼容
    if (isSupportTouch) {
      showPanel(0);
    }

    internalRef.current.isPressed = true;

    document.addEventListener(events.move, touchmove);
    document.addEventListener(events.end, touchend);
    document.addEventListener('touchcancel', touchend);
  };

  // 鼠标移动 或 触摸移动
  const touchmove = (e: any) => {
    if (!internalRef.current.isPressed) {
      return;
    }

    e.preventDefault();
    const { clientX, clientY } = getClient(e);

    let diffX = clientX - internalRef.current.startInfo.x; // 移动距离
    internalRef.current.trail.push([clientX, clientY]); // 记录移动轨迹

    if (latestStatus.current !== Status.Moving && diffX > 0) {
      setStatus(Status.Moving);
    }

    let puzzleLeft = diffX; // 拼图左偏移值
    let sliderButtonLeft = diffX; // 滑块按钮左偏移值

    if (internalRef.current.currentTargetType === CurrentTargetType.Puzzle) {
      diffX = Math.max(0, Math.min(diffX, internalRef.current.puzzleMaxDistance));
      puzzleLeft = diffX + puzzleSize.left;
      sliderButtonLeft = diffX * internalRef.current.ratio;
    } else {
      diffX = Math.max(0, Math.min(diffX, internalRef.current.buttonMaxDistance));
      sliderButtonLeft = diffX;
      puzzleLeft = diffX * internalRef.current.ratio + puzzleSize.left;
    }

    controlRef.current?.updateLeft(sliderButtonLeft);
    updatePuzzleLeft(puzzleLeft);
  };

  // 鼠标弹起 或 停止触摸
  const touchend = (e: any) => {
    document.removeEventListener(events.move, touchmove);
    document.removeEventListener(events.end, touchend);
    document.removeEventListener('touchcancel', touchend);

    if (!internalRef.current.isPressed) {
      return;
    }

    if (latestStatus.current !== Status.Moving) {
      internalRef.current.isPressed = false;

      // 如果是移动端事件，并且是触发式，隐藏浮层
      if (isSupportTouch) {
        hidePanel();
      }
      return;
    }

    if (onVerify) {
      internalRef.current.isPressed = false;
      setStatus(Status.Verify);

      const endTimestamp = new Date().getTime();
      const { clientX, clientY } = getClient(e);

      const diffY = clientY - internalRef.current.startInfo.y;
      let diffX = clientX - internalRef.current.startInfo.x; // 拼图移动距离
      let sliderOffsetX = diffX; // 滑块偏移值

      if (internalRef.current.currentTargetType === CurrentTargetType.Puzzle) {
        diffX = Math.max(0, Math.min(diffX, internalRef.current.puzzleMaxDistance));
        sliderOffsetX = diffX * internalRef.current.ratio;
      } else {
        diffX = Math.max(0, Math.min(diffX, internalRef.current.buttonMaxDistance));
        sliderOffsetX = diffX;
        diffX *= internalRef.current.ratio;
      }

      onVerify({
        x: diffX,
        y: diffY,
        sliderOffsetX,
        duration: endTimestamp - internalRef.current.startInfo.timestamp,
        trail: internalRef.current.trail,
        targetType: internalRef.current.currentTargetType,
        errorCount: internalRef.current.errorCount
      })
        .then(() => {
          internalRef.current.errorCount = 0;
          setStatus(Status.Success);
          hidePanel();
        })
        .catch(() => {
          internalRef.current.errorCount += 1;
          setStatus(Status.Error);

          if (isSupportTouch) {
            hidePanel();
          }

          if (
            (limitErrorCount <= 0 || internalRef.current.errorCount < limitErrorCount) &&
            autoRefreshOnError
          ) {
            internalRef.current.refreshTimer = setTimeout(() => {
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
  }, []);

  // 提供给外部
  useImperativeHandle(actionRef, () => ({
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
                ...(isLoading || isLoadFailed || !jigsawImgs?.bgUrl ? { display: 'none' } : {})
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
                ref={puzzleRef}
                onTouchStart={touchstartPuzzle}
                onMouseDown={touchstartPuzzle}
              />
              {showRefreshIcon && status !== Status.Success && refreshIcon && (
                <div
                  className={classnames(`${jigsawPrefixCls}-refresh`, {
                    [`${jigsawPrefixCls}-refresh-disabled`]:
                      status === Status.Verify || isLimitErrors
                  })}
                  onClick={handleClickRefreshIcon}
                >
                  {refreshIcon}
                </div>
              )}
              {jigsawContent}
            </div>
            <LoadingBox
              {...loadingBoxProps}
              style={{
                ...loadingBoxProps?.style,
                ...bgSize,
                ...(isLoading ? {} : { display: 'none' })
              }}
            />
            {isLoadFailed && (
              <div className={`${prefixCls}-load-failed`}>
                <SliderIcon type="imageFill" />
              </div>
            )}
          </div>
        </div>
      )}
      <ControlBar
        status={status}
        isLimitErrors={isLimitErrors}
        tipText={tipText}
        tipIcon={tipIcon}
        style={styles?.control}
        onClick={handleClickControl}
        indicatorProps={{
          style: styles?.indicator
        }}
        sliderButtonProps={{
          ...sliderButtonProps,
          onTouchStart: touchstartSliderButton,
          onMouseDown: touchstartSliderButton
        }}
        controlRef={controlRef}
      />
    </div>
  );
};

export default SliderCaptcha;
