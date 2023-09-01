/**
 * title: 验证失败不自动刷新
 * description: 设置 `autoRefreshOnError={false}` 。如果验证失败需要外部手动刷新 或 用户点击刷新图标。
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
