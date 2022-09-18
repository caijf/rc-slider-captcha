import SliderCaptcha from 'rc-slider-captcha';
import React, { useState } from 'react';
import { getCaptcha, verifyCaptcha } from './service2';

function Demo() {
  const [top, setTop] = useState(0);

  return (
    <SliderCaptcha
      request={() => {
        return getCaptcha().then((res) => {
          setTop(res.y);
          return res;
        });
      }}
      onVerify={(data) => {
        console.log(data);
        return verifyCaptcha(data);
      }}
      bgSize={{
        width: 310,
        height: 110
      }}
      puzzleSize={{
        width: 55,
        height: 45,
        top
      }}
    />
  );
}

export default Demo;
