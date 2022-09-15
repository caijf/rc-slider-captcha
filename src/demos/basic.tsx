import React from 'react';
import SliderCaptcha from 'rc-slider-captcha';
import { waitTime } from 'util-helpers';
import ImageBg from './bg@2x.jpeg';
import ImagePuzzle from './puzzle@2x.png';

const getCaptcha = async () => {
  await waitTime();
  return {
    bgUrl: ImageBg,
    puzzleUrl: ImagePuzzle,
  };
};

const verifyCaptcha = async (data: { x: number }) => {
  await waitTime();
  if (data.x && data.x > 87 && data.x < 93) {
    return Promise.resolve();
  }
  return Promise.reject();
};

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
