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
        autoRefreshOnError={false}
        actionRef={actionRef}
      />
      <div style={{ marginTop: 24 }}>
        <button onClick={() => actionRef.current?.refresh()}>点击刷新</button>
      </div>
    </div>
  );
}

export default Demo;
