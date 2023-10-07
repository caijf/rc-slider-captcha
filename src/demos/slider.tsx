import React, { useRef } from 'react';
import SliderCaptcha, { ActionType } from 'rc-slider-captcha';

function Demo() {
  const actionRef = useRef<ActionType>();

  return (
    <div>
      <SliderCaptcha
        mode="slider"
        tipText={{
          default: '请按住滑块，拖动到最右边',
          moving: '请按住滑块，拖动到最右边',
          error: '验证失败，请重新操作',
          success: '验证成功'
        }}
        errorHoldDuration={1000}
        onVerify={(data) => {
          console.log(data);
          // 默认背景图宽度 320 减去默认拼图宽度 60 所以滑轨宽度是 260
          if (data.x === 260) {
            return Promise.resolve();
          }
          return Promise.reject();
        }}
        actionRef={actionRef}
      />
      <div style={{ marginTop: 24 }}>
        <button onClick={() => actionRef.current?.refresh()}>点击重置</button>
      </div>
    </div>
  );
}

export default Demo;
