/**
 * debug: true
 * title: 自定义滑轨高度
 */
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
        style={{
          '--rcsc-control-height': '30px'
        }}
      />
      <br />
      <h3>底部显示浮层</h3>
      <SliderCaptcha
        mode="float"
        placement="bottom"
        style={{ zIndex: 2, '--rcsc-control-height': '100px' }}
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
