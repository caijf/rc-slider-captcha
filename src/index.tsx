import classnames from 'classnames';
import React, { ReactNode, useImperativeHandle, useMemo, useRef } from 'react';
import { useSafeState, useLatest, useMount } from 'rc-hooks';
import './style';
import { SliderButtonProps } from './SliderButton';
import {
  getClient,
  isSupportPointer,
  isSupportTouch,
  normalizeNumber,
  prefixCls,
  reflow,
  setStyle
} from './utils';
import ControlBar, { ControlBarRefType, TipIconType, TipTextType } from './ControlBar';
import { Status } from './interface';
import Jigsaw, { defaultConfig as jigsawDefaultConfig, JigsawProps, JigsawRefType } from './Jigsaw';

const events = isSupportPointer
  ? {
      start: 'pointerdown',
      move: 'pointermove',
      end: 'pointerup',
      cancel: 'pointercancel'
    }
  : isSupportTouch
    ? {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend',
        cancel: 'touchcancel'
      }
    : {
        start: 'mousedown',
        move: 'mousemove',
        end: 'mouseup',
        cancel: 'touchcancel'
      };
const startEventName = isSupportPointer
  ? 'onPointerDown'
  : isSupportTouch
    ? 'onTouchStart'
    : 'onMouseDown';

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
  | '--rcsc-control-height'
>;

type JigsawImages = {
  /**
   * 背景图
   */
  bgUrl: string;

  /**
   * 拼图
   */
  puzzleUrl: string;
};

export enum CurrentTargetType {
  Puzzle = 'puzzle',
  Button = 'button'
}

export type VerifyParam = {
  /**
   * 拼图 x 轴移动值。（这里指的是计算后的拼图移动距离。）
   *
   * 如果背景图和滑块有比例缩放，可能需要自己计算 x 乘以缩放比例
   */
  x: number;

  /**
   * 用户操作按钮或拼图 y 轴移动值。（按下鼠标到释放鼠标 y 轴的差值。）
   */
  y: number;

  /**
   * 滑块 x 轴偏移值。（暂时没有什么场景会用到）
   */
  sliderOffsetX: number;

  /**
   * 操作持续时长，单位毫秒。
   */
  duration: number;

  /**
   * 移动轨迹。
   */
  trail: [number, number][];

  /**
   * 操作 dom 目标。 `puzzle`-拼图 `button`-滑块按钮。
   */
  targetType: CurrentTargetType;

  /**
   * 连续错误次数。
   */
  errorCount: number;
};

export { Status };

// 常用操作
export type ActionType = {
  /**
   * @description 主动刷新。
   * @param resetErrorCount 是否重置连续错误次数为 `0`。默认为 `false`。
   * @returns
   */
  refresh: (resetErrorCount?: boolean) => void;

  /**
   * @description 每次获取返回当前的状态，注意它不是引用值，而是一个静态值。部分场景下配合自定义刷新操作使用。
   */
  status: Status;
};

export type SliderCaptchaProps = Pick<
  JigsawProps,
  'bgSize' | 'puzzleSize' | 'showRefreshIcon' | 'loadingBoxProps'
> & {
  /**
   * @description 限制连续错误次数。当连续错误次数达到限制时，不允许操作滑块和刷新图标，必须手动点击操作条刷新。`0` 表示不限制错误次数。
   * @default 0
   */
  limitErrorCount?: number;

  /**
   * @description 用户操作滑块完成后触发，主要用于验证，返回 `resolve` 表示验证成功，`reject` 表示验证失败。
   * @param data 验证参数。
   * @returns
   */
  onVerify: (data: VerifyParam) => Promise<any>;

  /**
   * @description 提示文本配置。
   * @default { default: '向右拖动滑块填充拼图', loading: '加载中...', moving: null, verifying: null, success: null, error: null, errors: (<><SliderIcon type="x" style={{ fontSize: 20 }} /> 失败过多，点击重试</>), loadFailed: '加载失败，点击重试' }
   */
  tipText?: Partial<TipTextType>;

  /**
   * @description 提示图标配置。
   */
  tipIcon?: Partial<
    TipIconType & {
      /**
       * @description 拼图区域刷新图标。
       * @default <SliderIcon type="refresh" />
       */
      refresh: JigsawProps['refreshIcon'];

      /**
       * @description 拼图区域加载失败图标。
       * @default <SliderIcon type="imageFill" />
       */
      loadFailed: ReactNode;
    }
  >;

  /**
   * @description 拼图区域刷新图标。
   * @deprecated 即将废弃，请使用 `tipIcon.refresh`。
   */
  refreshIcon?: ReactNode;

  /**
   * @description 自动发起请求。
   * @default true
   */
  autoRequest?: boolean;

  /**
   * @description 验证失败后自动刷新。
   * @default true
   */
  autoRefreshOnError?: boolean;

  /**
   * @description 常用操作，比如`刷新`。
   */
  actionRef?: React.MutableRefObject<ActionType | undefined>;

  /**
   * @description 拼图区域自定义内容，需要自己定义绝对定位和 `zIndex`。如“xx秒完成超过多少用户” 或隐藏刷新图标，自定义右上角内容。
   */
  jigsawContent?: React.ReactNode;

  /**
   * @description 错误停留多少毫秒后自动刷新。仅在 `autoRefreshOnError=true` 时生效。
   * @default 500
   */
  errorHoldDuration?: number;

  /**
   * @description 在滑动中和验证时始终显示拼图，验证完成后自动隐藏拼图。仅在 `mode=float` 时生效。
   * @default false
   */
  showJigsawOnActive?: boolean;

  /**
   * @description 设置 `loading` 状态延迟的时间，避免闪烁，单位为毫秒。
   * @default 0
   */
  loadingDelay?: number;

  /**
   * @description 浮层位置。仅在 `mode=float` 时生效。
   * @default 'top'
   */
  placement?: 'top' | 'bottom';

  /**
   * @description 滑轨按钮属性。
   */
  sliderButtonProps?: SliderButtonProps;

  /**
   * @description 数字精度。为避免内部计算产生精度问题，只对 `onVerify` 方法参数 `x` `y` `sliderOffsetX` 生效。
   * @default 7
   */
  precision?: number | false;

  /**
   * @description 类名。
   */
  className?: string;

  /**
   * @description 样式。
   */
  style?: StyleProp;

  /**
   * @description 配置内置模块样式。
   */
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
        /**
         * @description 模式。`embed`-嵌入式 `float`-触发式 `slider`-只有滑块无拼图，默认为 `embed`。
         */
        mode?: 'embed' | 'float';

        /**
         * @description 请求背景图和拼图。
         * @returns
         */
        request: () => Promise<JigsawImages>;
      }
    | {
        /**
         * @description 纯滑块不需要传入 `request`。
         */
        mode: 'slider';

        /**
         * @description 不要传。
         * @returns
         */
        request?: () => Promise<JigsawImages>;
      }
  );
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
  showJigsawOnActive = false,
  loadingDelay = 0,
  placement = 'top',
  loadingBoxProps,
  sliderButtonProps,
  precision = 7,
  className,
  style,
  styles
}) => {
  const [jigsawImgs, setJigsawImgs] = useSafeState<JigsawImages>();
  const [status, setStatus] = useSafeState<Status>(() => {
    if (!modeIsSlider && !!request && autoRequest) {
      return Status.Loading;
    }
    return Status.Default;
  });
  const latestStatus = useLatest(status); // 同步status值，提供给事件方法使用
  const controlRef = useRef<ControlBarRefType>(null);
  const jigsawRef = useRef<JigsawRefType>(null);

  // dom ref
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
    if (tipIcon?.refresh !== undefined) {
      return tipIcon.refresh;
    }
  }, [customRefreshIcon, tipIcon]);
  const bgSize = useMemo(() => ({ ...jigsawDefaultConfig.bgSize, ...outBgSize }), [outBgSize]);
  const puzzleSize = useMemo(
    () => ({ ...jigsawDefaultConfig.puzzleSize, ...outPuzzleSize }),
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

  const getControlHeight = () => {
    return controlRef.current?.getRect(true).height || 42;
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // console.error(err);
        if (hasLoadingDelay) {
          clearTimeout(internalRef.current.loadingTimer);
        }
        setJigsawImgs(undefined);
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
      const controlBarHeight = getControlHeight() + 'px';
      setStyle(panelRef.current, { [placementPos]: controlBarHeight, opacity: '1' });
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
      const controlBarHalfHeight = getControlHeight() / 2 + 'px';
      setStyle(panelRef.current, { [placementPos]: controlBarHalfHeight, opacity: '0' });
      internalRef.current.floatTransitionTimer = setTimeout(() => {
        setStyle(panelRef.current, { display: 'none' });
      }, 300);
    }, delay);
  };

  // 更新拼图位置
  const updatePuzzleLeft = (left: number) => {
    if (!modeIsSlider) {
      jigsawRef.current?.updateLeft(left);
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
    if (isLimitErrors || status === Status.LoadFailed) {
      refresh(isLimitErrors);
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
    if (isSupportTouch || (showJigsawOnActive && internalRef.current.isPressed)) {
      return;
    }
    hidePanel();
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
    // 可触屏电脑不支持触摸事件，但是 pointerType 可能为 'touch' 或 'pen'
    if (isSupportTouch || e.pointerType === 'pen' || e.pointerType === 'touch') {
      showPanel(0);
    }

    internalRef.current.isPressed = true;

    document.addEventListener(events.move, touchmove);
    document.addEventListener(events.end, touchend);
    document.addEventListener(events.cancel, touchend);
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
    document.removeEventListener(events.cancel, touchend);

    if (!internalRef.current.isPressed) {
      return;
    }

    if (latestStatus.current !== Status.Moving || typeof onVerify !== 'function') {
      internalRef.current.isPressed = false;

      // 如果是移动端事件，并且是触发式，隐藏浮层
      if (
        isSupportTouch ||
        e.pointerType === 'pen' ||
        e.pointerType === 'touch' ||
        showJigsawOnActive
      ) {
        hidePanel();
      }

      reset();
      return;
    }

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
      x: normalizeNumber(diffX, precision),
      y: normalizeNumber(diffY, precision),
      sliderOffsetX: normalizeNumber(sliderOffsetX, precision),
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

        if (
          isSupportTouch ||
          e.pointerType === 'pen' ||
          e.pointerType === 'touch' ||
          showJigsawOnActive
        ) {
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
  };

  useMount(() => {
    if (autoRequest) {
      getJigsawImages();
    }
  });

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
            <Jigsaw
              status={status}
              bgSize={bgSize}
              puzzleSize={puzzleSize}
              bgUrl={jigsawImgs?.bgUrl}
              puzzleUrl={jigsawImgs?.puzzleUrl}
              jigsawRef={jigsawRef}
              loadingBoxProps={loadingBoxProps}
              loadFailedIcon={tipIcon?.loadFailed}
              showRefreshIcon={showRefreshIcon}
              refreshIcon={refreshIcon}
              disabledRefresh={isLimitErrors}
              onRefresh={refresh}
              style={styles?.jigsaw}
              bgImgProps={{ style: styles?.bgImg }}
              puzzleImgProps={{
                style: styles?.puzzleImg,
                [startEventName]: touchstartPuzzle
              }}
            >
              {jigsawContent}
            </Jigsaw>
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
        indicatorProps={{ style: styles?.indicator }}
        sliderButtonProps={{
          ...sliderButtonProps,
          [startEventName]: touchstartSliderButton
        }}
        controlRef={controlRef}
      />
    </div>
  );
};

export default SliderCaptcha;
