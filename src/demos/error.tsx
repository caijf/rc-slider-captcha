/**
 * title: 验证失败不自动刷新
 * description: 设置 `autoRefreshOnError={false}` 。如果验证失败需要外部手动刷新 或 用户点击刷新图标。
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
      autoRefreshOnError={false}
    />
  );
}

export default Demo;
