/**
 * description:  回调方法 `onVerify` 的参数 [VerifyParam](#verifyparam) 一般情况下只需要用到拼图 `x` 轴偏移值。
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
