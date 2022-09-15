/**
 * title: 触发式
 * description: 设置 `mode="float"`。
 */
import React from 'react';
import SliderCaptcha from 'rc-slider-captcha';
import { getCaptcha, verifyCaptcha } from './service1';

function Demo() {
  return (
    <SliderCaptcha
      mode="float"
      request={getCaptcha}
      onVerify={(data) => {
        console.log(data);
        return verifyCaptcha(data);
      }}
    />
  );
}

export default Demo;
