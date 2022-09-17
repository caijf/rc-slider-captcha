import classnames from 'classnames';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import LoadingBox, { LoadingBoxProps } from './LoadingBox';
import SliderButton, { SliderButtonProps } from './SliderButton';
import SliderIcon from './SliderIcon';
import useUpdate from './hooks/useUpdate';
import useStateRef from './hooks/useStateRef';
import { getClient, isBrowser, reflow, setStyle, isSupportTouch, prefixCls } from './utils';
import './style';
import './index.less';

// TODO 构建、测试

type TipTextType = {
  default: ReactNode;
  loading: ReactNode;
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

enum CurrentTargetType {
  Puzzle = 'puzzle',
  Button = 'button',
}

type VerifyParam = {
  x: number; // 拼图 x轴移动值
  y: number; // y 轴移动值
  duration: number; // 操作持续时长
  trail: [number, number][]; // 移动轨迹
  targetType: CurrentTargetType; // 操作dom目标
  errorCount: number; // 期间连续错误次数
};

// 内部状态
export enum Status {
  Default = 1,
  Loading,
  Verify,
  Success,
  Error,
}

// 常用操作
export type ActionType = {
  refresh: (resetErrorCount?: boolean) => void; // 刷新，参数为是否重置连续错误次数为0
  status: Status; // 每次获取返回当前的状态，注意它不是引用值，而是一个静态值。部分场景下配合自定义刷新操作使用。
};

export interface SliderCaptchaProps {
  mode?: 'embed' | 'float'; // 模式，embed-嵌入式 float-触发式，默认为 embed。
  limitErrorCount?: number; // 限制连续错误次数
  onVerify: (data: VerifyParam) => Promise<any>; // 移动松开后触发验证方法
  tipText?: Partial<TipTextType>; // 提示文本
  tipIcon?: Partial<TipIconType>; // 提示图标
  bgSize?: Partial<Pick<SizeType, 'width' | 'height'>>; // 背景图片尺寸
  puzzleSize?: Partial<SizeType>; // 拼图尺寸和偏移调整
  request: () => Promise<JigsawImages>; // 请求背景图和拼图
  autoRequest?: boolean; // 自动发起请求
  autoRefreshOnError?: boolean; // 验证失败后自动刷新
  actionRef?: React.MutableRefObject<ActionType | undefined>; // 常用操作
  showRefreshIcon?: boolean; // 显示右上角刷新图标
  jigsawContent?: React.ReactNode; // 面板内容，如xx秒完成超过多少用户；或隐藏刷新图标，自定义右上角内容。
  errorHoldDuration?: number; // 错误停留时长，仅在 autoRefreshOnError = true 时生效
  loadingBoxProps?: LoadingBoxProps;
  sliderButtonProps?: SliderButtonProps;
  className?: string;
  style?: React.CSSProperties;
}

const controlPrefixCls = `${prefixCls}-control`;
const jigsawPrefixCls = `${prefixCls}-jigsaw`;

const SliderButtonWidth = 40; // 滑块按钮宽度
const SliderBorderWidth = 2; // 滑块边框宽度

// 默认配置
const defaultConfig = {
  bgSize: {
    width: 320,
    height: 160,
  },
  puzzleSize: {
    width: 60,
    left: 0,
  },
  tipText: {
    default: '向右拖动滑块填充拼图',
    loading: '加载中...',
    errors: (
      <>
        <SliderIcon type="x" style={{ fontSize: 20 }} /> 失败过多，点击重试
      </>
    ),
  } as TipTextType,
  tipIcon: {
    default: <SliderIcon type="arrowRight" />,
    loading: <SliderIcon type="loading" spin />,
    error: <SliderIcon type="x" />,
    success: <SliderIcon type="check" />,
    refresh: <SliderIcon type="refresh" />,
  } as TipIconType,
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
  loadingBoxProps,
  sliderButtonProps,
  className,
  style,
}) => {
  const [jigsawImgs, setJigsawImgs] = useState<JigsawImages>();
  const [status, setStatus] = useState<Status>(Status.Default);
  const statusRef = useStateRef(status); // 同步status值，提供给事件方法使用
  const update = useUpdate(); // 触发组件渲染

  // dom ref
  const sliderButtonRef = useRef<HTMLSpanElement>(null);
  const puzzleRef = useRef<HTMLImageElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // config
  const mode = useMemo(() => (outMode === 'float' ? outMode : 'embed'), []); // 模式
  const modeRef = useStateRef<typeof mode>(mode); // 提供给事件方法使用
  const tipText = useMemo(() => ({ ...defaultConfig.tipText, ...outTipText }), [outTipText]);
  const tipIcon = useMemo(() => ({ ...defaultConfig.tipIcon, ...outTipIcon }), [outTipIcon]);
  const bgSize = useMemo(() => ({ ...defaultConfig.bgSize, ...outBgSize }), [outBgSize]);
  const puzzleSize = useMemo(
    () => ({ ...defaultConfig.puzzleSize, ...outPuzzleSize }),
    [outPuzzleSize],
  );

  const currentTargetTypeRef = useRef<CurrentTargetType>(CurrentTargetType.Button); // 当前触发事件的节点，拼图或按钮
  const errorCountRef = useRef(0); // 连续错误次数
  const startInfoRef = useRef({ x: 0, y: 0, timestamp: 0 }); // 鼠标按下或触摸开始信息
  const trailRef = useRef([] as [number, number][]); // 移动轨迹
  const isPressedRef = useRef(false); // 标识是否按下
  const isMovedRef = useRef(false); // 标识是否移动过
  const sliderButtonWidthRef = useRef(SliderButtonWidth); // 滑块按钮宽度

  const floatTransitionTimerRef = useRef<any>(null); // 触发式渐变过渡效果定时器
  const floatDelayShowTimerRef = useRef<any>(null); // 触发式鼠标移入定时器
  const floatDelayHideTimerRef = useRef<any>(null); // 触发式鼠标移出定时器
  const refreshTimerRef = useRef<any>(null); // 自动刷新的定时器
  const isLimitErrors =
    statusRef.current === Status.Error &&
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
    setStatus(Status.Loading);
    const result = await request();
    setJigsawImgs(result);
    setStatus(Status.Default);
  };

  // 触发式下，显示面板
  const showPanel = (delay = 300) => {
    if (modeRef.current !== 'float' || statusRef.current === Status.Success) {
      return;
    }

    clearTimeout(floatTransitionTimerRef.current);
    clearTimeout(floatDelayHideTimerRef.current);

    floatDelayShowTimerRef.current = setTimeout(() => {
      setStyle(panelRef.current, { display: 'block' });
      reflow(panelRef.current);
      setStyle(panelRef.current, { bottom: '42px', opacity: '1' });
    }, delay);
  };

  // 触发式下，隐藏面板
  const hidePanel = (delay = 300) => {
    if (modeRef.current !== 'float') {
      return;
    }

    clearTimeout(floatDelayShowTimerRef.current);
    floatDelayHideTimerRef.current = setTimeout(() => {
      setStyle(panelRef.current, { bottom: '22px', opacity: '0' });
      floatTransitionTimerRef.current = setTimeout(() => {
        setStyle(panelRef.current, { display: 'none' });
      }, 300);
    }, delay);
  };

  // 重置状态和元素位置
  const reset = () => {
    isPressedRef.current = false;
    isMovedRef.current = false;
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
    if (statusRef.current === Status.Loading) {
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
    if (statusRef.current !== Status.Default) {
      return;
    }

    e.preventDefault(); // 防止移动端按下后会选择文本或图片

    const isTouchEvent = e.type === 'touchstart'; // 是否为移动端事件
    const target = e.currentTarget as HTMLElement; // 用于判断当前触发事件的节点

    if (target && sliderButtonRef.current && puzzleRef.current) {
      const { clientX, clientY } = getClient(e);

      startInfoRef.current = {
        x: clientX,
        y: clientY,
        timestamp: new Date().getTime(),
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
      if (isTouchEvent) {
        showPanel(0);
      }

      isPressedRef.current = true;
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

    if (!isMovedRef.current && diffX > 0) {
      isMovedRef.current = true;
      update();
    }

    let puzzleLeft = diffX; // 拼图左偏移值
    let sliderButtonLeft = diffX; // 滑块按钮左偏移值

    if (currentTargetTypeRef.current === CurrentTargetType.Puzzle) {
      diffX = Math.max(0, Math.min(diffX, maxDistanceRef.current.puzzle));
      puzzleLeft = diffX + +puzzleSize.left;
      sliderButtonLeft = diffX * ratioRef.current;
    } else {
      diffX = Math.max(0, Math.min(diffX, maxDistanceRef.current.button));
      sliderButtonLeft = diffX;
      puzzleLeft = diffX * ratioRef.current + puzzleSize.left;
    }

    setStyle(sliderButtonRef.current, { left: sliderButtonLeft + 'px' });
    setStyle(indicatorRef.current, {
      width: sliderButtonLeft + sliderButtonWidthRef.current + 'px',
    });
    setStyle(puzzleRef.current, { left: puzzleLeft + 'px' });
  };

  // 鼠标弹起 或 停止触摸
  const touchend = (e: any) => {
    const isTouchEvent = e.type === 'touchend'; // 是否为移动端事件

    if (!isPressedRef.current || !isMovedRef.current) {
      if (isTouchEvent && isPressedRef.current) {
        hidePanel();
      }
      isPressedRef.current = false;
      isMovedRef.current = false;
      return;
    }

    if (onVerify) {
      isPressedRef.current = false;
      isMovedRef.current = false;
      setStatus(Status.Verify);

      const endTimestamp = new Date().getTime();
      const { clientX, clientY } = getClient(e);

      const diffY = clientY - startInfoRef.current.y;
      let diffX = clientX - startInfoRef.current.x; // 移动距离
      if (currentTargetTypeRef.current === CurrentTargetType.Puzzle) {
        diffX = Math.max(0, Math.min(diffX, maxDistanceRef.current.puzzle));
      } else {
        diffX = Math.max(0, Math.min(diffX, maxDistanceRef.current.button));
        diffX *= ratioRef.current;
      }

      onVerify({
        x: diffX,
        y: diffY,
        duration: endTimestamp - startInfoRef.current.timestamp,
        trail: trailRef.current,
        targetType: currentTargetTypeRef.current,
        errorCount: errorCountRef.current,
      })
        .then(() => {
          errorCountRef.current = 0;
          setStatus(Status.Success);
          hidePanel();
        })
        .catch(() => {
          errorCountRef.current += 1;
          setStatus(Status.Error);

          if (isTouchEvent) {
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

    const events = isSupportTouch
      ? {
          start: 'touchstart',
          move: 'touchmove',
          end: 'touchend',
        }
      : {
          start: 'mousedown',
          move: 'mousemove',
          end: 'mouseup',
        };

    if (isBrowser && sliderButtonRef.current && puzzleRef.current) {
      sliderButtonRef.current.addEventListener(events.start, touchstart);
      puzzleRef.current.addEventListener(events.start, touchstart);
      document.addEventListener(events.move, touchmove);
      document.addEventListener(events.end, touchend);

      return () => {
        if (isBrowser && sliderButtonRef.current && puzzleRef.current) {
          sliderButtonRef.current.removeEventListener(events.start, touchstart);
          puzzleRef.current.removeEventListener(events.start, touchstart);
          document.removeEventListener(events.move, touchmove);
          document.removeEventListener(events.end, touchend);
        }
      };
    }
  }, []);

  const loading = status === Status.Loading; // 加载中
  const isStop = status === Status.Verify || status === Status.Error || status === Status.Success; // 是否停止滑动

  // 当前提示文本
  const currentTipText = useMemo(() => {
    if (status === Status.Default && !isMovedRef.current) {
      return tipText.default;
    }
    if (status === Status.Loading) {
      return tipText.loading;
    }
    if (isLimitErrors) {
      return tipText.errors;
    }
    return null;
  }, [status, tipText, isMovedRef.current, isLimitErrors]);

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
      return statusRef.current;
    },
  }));

  return (
    <div
      className={classnames(prefixCls, className, `${prefixCls}-${mode}`)}
      style={{ width: bgSize.width, ...style }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`${prefixCls}-panel`} ref={panelRef}>
        <div className={`${prefixCls}-panel-inner`} style={{ height: bgSize.height }}>
          <div
            className={classnames(jigsawPrefixCls, { [`${jigsawPrefixCls}-stop`]: isStop })}
            style={{ ...bgSize, ...(loading ? { display: 'none' } : {}) }}
          >
            <img
              className={`${jigsawPrefixCls}-bg`}
              style={bgSize}
              src={jigsawImgs?.bgUrl}
              alt="验证码背景"
            />
            <img
              className={`${jigsawPrefixCls}-puzzle`}
              style={puzzleSize}
              src={jigsawImgs?.puzzleUrl}
              alt="验证码滑块"
              data-id={CurrentTargetType.Puzzle}
              ref={puzzleRef}
            />
            {showRefreshIcon && status !== Status.Success && tipIcon.refresh && (
              <div
                className={classnames(`${jigsawPrefixCls}-refresh`, {
                  [`${jigsawPrefixCls}-refresh-disabled`]:
                    status === Status.Verify || isLimitErrors,
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
              ...(loading ? {} : { display: 'none' }),
            }}
          />
        </div>
      </div>
      <div
        className={classnames(controlPrefixCls, {
          [`${controlPrefixCls}-loading`]: loading,
          [`${controlPrefixCls}-moving`]: isMovedRef.current && !isLimitErrors,
          [`${controlPrefixCls}-verify`]: status === Status.Verify,
          [`${controlPrefixCls}-success`]: status === Status.Success,
          [`${controlPrefixCls}-error`]: status === Status.Error && !isLimitErrors,
          [`${controlPrefixCls}-errors`]: isLimitErrors,
        })}
        onClick={handleClickControl}
      >
        <div className={classnames(`${controlPrefixCls}-indicator`)} ref={indicatorRef} />
        <SliderButton
          {...sliderButtonProps}
          className={classnames(`${controlPrefixCls}-button`, sliderButtonProps?.className)}
          disabled={loading}
          active={isMovedRef.current}
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
