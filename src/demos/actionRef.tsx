/**
 * description: 假如滑动验证成功之后，等一段时间再去提交表单，服务返回验证码失效。这时候可以通过主动刷新滑块验证码，并提示用户重新验证。
 */
import SliderCaptcha, { ActionType } from 'rc-slider-captcha';
import React, { useRef } from 'react';
import { getCaptcha, verifyCaptcha } from './service1';

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
