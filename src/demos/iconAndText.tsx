import React from 'react';
import { ArrowRepeat, EmojiFrownFill, EmojiSmileFill, HeartFill } from 'doly-icons';
import SliderCaptcha from 'rc-slider-captcha';
import { getCaptcha, verifyCaptcha } from './service1';

function Demo() {
  return (
    <SliderCaptcha
      request={getCaptcha}
      onVerify={(data) => {
        console.log(data);
        return verifyCaptcha(data);
      }}
      tipIcon={{
        default: <HeartFill style={{ color: '#e91e63' }} />,
        loading: <ArrowRepeat spin />,
        success: <EmojiSmileFill />,
        error: <EmojiFrownFill />,
        refresh: <ArrowRepeat />,
      }}
      tipText={{
        default: '向右👉拖动爱心❤️完成拼图哦～',
        loading: '👩🏻‍💻🧑‍💻努力中...',
      }}
    />
  );
}

export default Demo;
