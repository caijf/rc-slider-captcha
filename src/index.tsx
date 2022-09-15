import classnames from 'classnames';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { prefixCls } from './config';
import LoadingBox from './LoadingBox';
import SliderButton from './SliderButton';
import SliderIcon from './SliderIcon';

import './index.less';
import useUpdate from './hooks/useUpdate';
import useStateRef from './hooks/useStateRef';
import { getClient, isBrowser, reflow, setStyle, isSupportTouch } from './utils';

// TODO 改用css变量、构建、浏览器兼容、测试

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

enum Status {
  Default = 1,
  Loading,
  Verify,
  Success,
  Error,
}

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

export type ActionType = {
  refresh: (resetLimitErrors?: boolean) => void;
};

export interface SliderCaptchaProps {
  mode?: 'embed' | 'float'; // 模式，embed-嵌入式 float-触发式，默认为 embed。
  limitErrorCount?: number; // 限制连续错误次数
  onVerify: (data: VerifyParam) => Promise<any>; // 移动松开后触发验证方法
  tipText?: Partial<TipTextType>;
  tipIcon?: Partial<TipIconType>;
  bgSize?: Partial<Pick<SizeType, 'width' | 'height'>>; // 背景图片尺寸
  puzzleSize?: Partial<SizeType>; // 拼图尺寸和偏移调整
  request: () => Promise<JigsawImages>; // 请求背景图和拼图
  autoRequest?: boolean; // 自动发起请求
  autoRefreshOnError?: boolean; // 验证失败后自动刷新
  actionRef?: React.MutableRefObject<ActionType | undefined>; // 手动操作
  showRefreshIcon?: boolean; // 显示右上角刷新图标
  jigsawContent?: React.ReactNode; // 面板内容，如xx秒完成超过多少用户；或隐藏刷新图标，自定义右上角内容。
  errorHoldDuration?: number; // 错误停留时长，仅在 autoRefreshOnError = true 时生效
}

const controlPrefixCls = `${prefixCls}-control`;
const jigsawPrefixCls = `${prefixCls}-jigsaw`;

const SliderButtonWidth = 40;
const JigsawBorderWidth = 2;

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
  errorHoldDuration = 1000,
}) => {
  const [jigsawImgs, setJigsawImgs] = useState<JigsawImages>();
  const [status, setStatus] = useState<Status>(Status.Default);
  const statusRef = useStateRef(status);
  const update = useUpdate();

  // dom ref
  const sliderButtonRef = useRef<HTMLSpanElement>(null);
  const puzzleRef = useRef<HTMLImageElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // config
  const mode = useMemo(() => (outMode === 'float' ? outMode : 'embed'), []);
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

  const modeRef = useStateRef<typeof mode>(mode); // 模式
  const floatTransitionTimerRef = useRef<any>(null); // 触发式渐变过渡效果定时器
  const floatDelayShowTimerRef = useRef<any>(null); // 触发式鼠标移入定时器
  const floatDelayHideTimerRef = useRef<any>(null); // 触发式鼠标移出定时器
  const refreshTimerRef = useRef<any>(null); // 自动刷新的定时器
  const isLimitErrors =
    statusRef.current === Status.Error &&
    limitErrorCount > 0 &&
    errorCountRef.current >= limitErrorCount;

  const maxDistanceRef = useRef({ button: 0, puzzle: 0 }); // 最大可移动距离
  const ratioRef = useRef(1); // 当滑块或拼图为触发事件的焦点时的变换比例
  // 更新最大可移动距离
  const updateMaxDistance = () => {
    const w = sliderButtonRef.current ? sliderButtonRef.current.clientWidth : SliderButtonWidth;
    maxDistanceRef.current.button = bgSize.width - w - JigsawBorderWidth;
    maxDistanceRef.current.puzzle = bgSize.width - puzzleSize.width - puzzleSize.left;
  };

  // 获取背景图和拼图
  const getJigsawImages = async () => {
    setStatus(Status.Loading);
    const result = await request();
    setJigsawImgs(result);
    setStatus(Status.Default);
  };

  // 重置状态和元素位置
  const reset = () => {
    isPressedRef.current = false;
    isMovedRef.current = false;
    setStatus(Status.Default);

    setStyle(sliderButtonRef.current, 'left', '0px');
    setStyle(indicatorRef.current, 'width', '0px');
    setStyle(puzzleRef.current, 'left', puzzleSize.left + 'px');
  };

  // 刷新
  const refresh = (resetLimitErrors = false) => {
    if (resetLimitErrors) {
      errorCountRef.current = 0;
    }
    clearTimeout(refreshTimerRef.current);
    reset();
    getJigsawImages();
  };

  const showPanel = () => {
    if (modeRef.current !== 'float' || statusRef.current === Status.Success) {
      return;
    }

    clearTimeout(floatTransitionTimerRef.current);
    clearTimeout(floatDelayHideTimerRef.current);

    floatDelayShowTimerRef.current = setTimeout(() => {
      setStyle(panelRef.current, 'display', 'block');
      reflow(panelRef.current);
      setStyle(panelRef.current, 'bottom', '42px');
      setStyle(panelRef.current, 'opacity', '1');
    }, 300);
  };

  const hidePanel = () => {
    if (modeRef.current !== 'float') {
      return;
    }

    clearTimeout(floatDelayShowTimerRef.current);
    floatDelayHideTimerRef.current = setTimeout(() => {
      setStyle(panelRef.current, 'bottom', '22px');
      setStyle(panelRef.current, 'opacity', '0');
      floatTransitionTimerRef.current = setTimeout(() => {
        setStyle(panelRef.current, 'display', 'none');
      }, 300);
    }, 300);
  };

  const handleClickControl = () => {
    if (isLimitErrors) {
      refresh(true);
    }
  };

  const handleMouseEnterControl = () => {
    if (isSupportTouch) {
      return;
    }
    showPanel();
  };

  const handleMouseLeaveControl = () => {
    if (isSupportTouch) {
      return;
    }
    hidePanel();
  };

  const handleClickRefresh = () => {
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

      updateMaxDistance();
      currentTargetTypeRef.current = target.getAttribute('data-id') as CurrentTargetType;

      // 最大可移动区间值比例
      ratioRef.current = maxDistanceRef.current.puzzle / maxDistanceRef.current.button;
      if (currentTargetTypeRef.current === CurrentTargetType.Puzzle) {
        ratioRef.current = 1 / ratioRef.current;
      }

      // 处理移动端-触发式兼容
      if (isTouchEvent) {
        showPanel();
      }

      isPressedRef.current = true;
    }
  };

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

    if (currentTargetTypeRef.current === CurrentTargetType.Puzzle) {
      diffX = Math.max(0, Math.min(diffX, maxDistanceRef.current.puzzle));
      const distance = diffX * ratioRef.current;

      setStyle(sliderButtonRef.current, 'left', distance + 'px');
      setStyle(indicatorRef.current, 'width', distance + SliderButtonWidth + 'px');
      setStyle(puzzleRef.current, 'left', diffX + puzzleSize.left + 'px');
    } else {
      diffX = Math.max(0, Math.min(diffX, maxDistanceRef.current.button));
      const distance = diffX * ratioRef.current;

      setStyle(sliderButtonRef.current, 'left', diffX + 'px');
      setStyle(indicatorRef.current, 'width', diffX + SliderButtonWidth + 'px');
      setStyle(puzzleRef.current, 'left', distance + puzzleSize.left + 'px');
    }
  };
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

  const loading = status === Status.Loading;
  const isDone = status === Status.Verify || status === Status.Error || status === Status.Success;

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

  React.useImperativeHandle(actionRef, () => ({
    refresh,
  }));

  return (
    <div
      className={classnames(prefixCls, `${prefixCls}-${mode}`)}
      style={{ width: bgSize.width }}
      onMouseEnter={handleMouseEnterControl}
      onMouseLeave={handleMouseLeaveControl}
    >
      <div className={`${prefixCls}-panel`} ref={panelRef}>
        <div className={`${prefixCls}-panel-inner`} style={{ height: bgSize.height }}>
          <div
            className={classnames(jigsawPrefixCls, { [`${jigsawPrefixCls}-done`]: isDone })}
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
            {showRefreshIcon && status !== Status.Success && (
              <SliderIcon
                type="refresh"
                className={classnames(`${jigsawPrefixCls}-refresh`, {
                  [`${jigsawPrefixCls}-refresh-disabled`]:
                    status === Status.Verify || isLimitErrors,
                })}
                onClick={handleClickRefresh}
              />
            )}
            {jigsawContent}
          </div>
          <LoadingBox style={{ ...bgSize, ...(loading ? {} : { display: 'none' }) }} />
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
          className={`${controlPrefixCls}-button`}
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
