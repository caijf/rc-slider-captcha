/**
 * title: 触发式
 * description: 支持外部手动触发刷新。比如，滑动验证成功，但是等了很久再去点击提交操作。服务可能报错`验证码过期`，这时候就需要前端手动去刷新验证码。
 */
import React, { useRef } from 'react';
import SliderCaptcha, { ActionType } from 'rc-slider-captcha';
import { getCaptcha, verifyCaptcha } from './service';

function Demo() {
  const actionRef = useRef<ActionType>();

  return (
    <div>
      <SliderCaptcha
        mode="float"
        request={getCaptcha}
        onVerify={(data) => {
          console.log(data);
          return verifyCaptcha(data);
        }}
        actionRef={actionRef}
      />
      <div style={{ marginTop: 24 }}>
        <button onClick={() => actionRef.current?.refresh()}>点击刷新</button>
      </div>
    </div>
  );
}

export default Demo;
