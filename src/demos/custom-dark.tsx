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
      style={
        {
          '--rcsc-bg-color': '#141414',
          '--rcsc-text-color': 'rgba(255, 255, 255, 0.85)',
          '--rcsc-border-color': '#424242',
          '--rcsc-button-color': 'rgba(255, 255, 255, 0.65)',
          '--rcsc-button-bg-color': '#333'
        } as React.CSSProperties
      }
    />
  );
}

export default Demo;
