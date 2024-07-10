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
      tipText={{
        default: 'Drag to complete the puzzle',
        loading: 'Loading...',
        moving: 'Drag right to the puzzle',
        verifying: 'Verifying',
        error: 'Failed'
      }}
      loadingBoxProps={{
        text: 'loading'
      }}
    />
  );
}

export default Demo;
