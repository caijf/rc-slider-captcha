import SliderCaptcha from 'rc-slider-captcha';
import React from 'react';
import { getCaptcha, verifyCaptcha } from './service1';

function Demo() {
  return (
    <>
      <SliderCaptcha
        mode="float"
        request={getCaptcha}
        onVerify={(data) => {
          console.log(data);
          return verifyCaptcha(data);
        }}
      />
      <br />
      <h3>激活时始终显示拼图</h3>
      <p>showJigsawOnActive=true</p>
      <SliderCaptcha
        mode="float"
        style={{ zIndex: 2 }}
        request={getCaptcha}
        onVerify={(data) => {
          console.log(data);
          return verifyCaptcha(data);
        }}
        showJigsawOnActive
      />
      <br />
      <h3>底部显示浮层</h3>
      <SliderCaptcha
        mode="float"
        placement="bottom"
        style={{ zIndex: 2 }}
        request={getCaptcha}
        onVerify={(data) => {
          console.log(data);
          return verifyCaptcha(data);
        }}
      />
    </>
  );
}

export default Demo;
