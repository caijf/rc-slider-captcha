/**
 * title: 基础用法
 * description:  回调方法 `onVerify` 的参数一般情况下只需要用到 `x` 。
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
    />
  );
}

export default Demo;
