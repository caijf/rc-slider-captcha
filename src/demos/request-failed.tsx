import SliderCaptcha from 'rc-slider-captcha';
import React from 'react';
import { getCaptcha, verifyCaptcha } from './service4';

function Demo() {
  return (
    <SliderCaptcha
      request={getCaptcha}
      onVerify={(data) => {
        console.log(data);
        return verifyCaptcha(data);
      }}
      // tipText={{
      //   loadFailed: '🧑‍💻加载失败，点击重新加载'
      // }}
    />
  );
}

export default Demo;
