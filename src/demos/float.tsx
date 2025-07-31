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
      <h3>移动中或验证时始终显示拼图</h3>
      <p>鼠标拖动过程中，移出滑块拼图区域也显示拼图。</p>
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
