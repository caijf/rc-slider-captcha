/**
 * debug: true
 */
import { ArrowRepeat, EmojiFrownFill, EmojiSmileFill, Gem, Heart } from 'doly-icons';
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
      tipIcon={{
        default: <Gem />,
        loading: <ArrowRepeat spin />,
        success: <EmojiSmileFill />,
        error: <EmojiFrownFill />,
        refresh: <ArrowRepeat />
      }}
      tipText={{
        default: '向右👉拖动完成拼图',
        loading: '👩🏻‍💻🧑‍💻努力中...',
        moving: '向右拖动至拼图位置',
        verifying: '验证中...',
        error: '验证失败'
      }}
      loadingBoxProps={{
        icon: <Heart />,
        text: "I'm loading"
      }}
      style={{
        '--rcsc-primary': '#e91e63',
        '--rcsc-primary-light': '#f8bbd0',
        '--rcsc-text-color': 'gray',
        '--rcsc-panel-border-radius': '10px',
        '--rcsc-control-border-radius': '20px'
      }}
      styles={{
        panel: { fontSize: 14 },
        jigsaw: { fontSize: 16 },
        bgImg: { fontSize: 18 },
        puzzleImg: { fontSize: 20 },
        control: { fontSize: 22 },
        indicator: { fontSize: 24 }
      }}
    />
  );
}

export default Demo;
