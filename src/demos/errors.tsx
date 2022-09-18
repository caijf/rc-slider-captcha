/**
 * title: 连续失败次数限制
 * description: 当连续失败3次后，需要点击滑块控制条才能刷新。
 */
import SliderCaptcha from 'rc-slider-captcha';
import React from 'react';
import { getCaptcha, verifyCaptcha } from './service1';

function Demo() {
  return (
    <SliderCaptcha
      request={getCaptcha}
      onVerify={(data) => {
        console.log(data);
        return verifyCaptcha(data);
      }}
      limitErrorCount={3}
    />
  );
}

export default Demo;
