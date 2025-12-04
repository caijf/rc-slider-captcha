import React, { useEffect, useRef } from 'react';
import SliderCaptcha, { ActionType, Status } from 'rc-slider-captcha';
import { useSize } from 'rc-hooks';

function Demo() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { width } = useSize(wrapperRef);
  const actionRef = useRef<ActionType>(undefined);

  const finalWidth = width || 320;
  const controlButtonWidth = 40;
  const indicatorBorderWidth = 2;

  useEffect(() => {
    if (actionRef.current && actionRef.current.status === Status.Success) {
      actionRef.current.refresh();
      // reset your slider captcha flag
      // ...
    }
  }, [width]);

  return (
    <>
      <div ref={wrapperRef}>
        <SliderCaptcha
          mode="slider"
          tipText={{
            default: '请按住滑块，拖动到最右边',
            moving: '请按住滑块，拖动到最右边',
            error: '验证失败，请重新操作',
            success: '验证成功'
          }}
          errorHoldDuration={1000}
          bgSize={{
            width: finalWidth
          }}
          // 手动设置拼图宽度等于滑块宽度。后面大版本更新会将该模式下的拼图宽度改为和滑块宽度一致。
          puzzleSize={{
            left: indicatorBorderWidth,
            width: controlButtonWidth
          }}
          onVerify={(data) => {
            console.log(data);
            if (data.x === finalWidth - controlButtonWidth - indicatorBorderWidth) {
              return Promise.resolve();
            }
            return Promise.reject();
          }}
          actionRef={actionRef}
        />
      </div>
      <div style={{ marginTop: 24 }}>
        <button onClick={() => actionRef.current?.refresh()}>点击重置</button>
      </div>
    </>
  );
}

export default Demo;
