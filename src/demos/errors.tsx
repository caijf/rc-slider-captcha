/**
 * title: 连续失败次数限制
 * description: 当连续失败3次后，需要点击滑块控制条才能刷新。
 */
import SliderCaptcha, { ActionType } from 'rc-slider-captcha';
import React, { useRef } from 'react';
import { getCaptcha, verifyCaptcha } from './service1';

function Demo() {
  const actionRef = useRef<ActionType>();

  return (
    <div>
      <SliderCaptcha
        request={getCaptcha}
        onVerify={(data) => {
          console.log(data);
          return verifyCaptcha(data);
        }}
        limitErrorCount={3}
        actionRef={actionRef}
      />
      <div style={{ marginTop: 24 }}>
        <button onClick={() => actionRef.current?.refresh()}>点击刷新</button>
      </div>
    </div>
  );
}

export default Demo;
