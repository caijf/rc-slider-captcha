import React, { useState } from 'react';
import SliderCaptcha from 'rc-slider-captcha';
import { getCaptcha, verifyCaptcha } from './service3';

function Demo() {
  const [top, setTop] = useState(0);

  return (
    <SliderCaptcha
      mode="float"
      request={getCaptcha}
      onVerify={(data) => {
        console.log(data);
        return verifyCaptcha(data);
      }}
      bgSize={{
        width: 348,
        height: 110,
      }}
      puzzleSize={{
        width: 62,
      }}
    />
  );
}

export default Demo;
