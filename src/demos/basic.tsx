/**
 * title: 嵌入式
 * description: 默认 `mode="embed"`，无需设置。
 */
import React from 'react';
import SliderCaptcha from 'rc-slider-captcha';
import { getCaptcha, verifyCaptcha } from './service1';

function Demo() {
  return (
    <SliderCaptcha
      request={getCaptcha}
      onVerify={(data) => {
        console.log(data);
        return verifyCaptcha(data);
      }}
    />
  );
}

export default Demo;
