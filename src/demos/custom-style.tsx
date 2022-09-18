import { ArrowRepeat, EmojiFrownFill, EmojiSmileFill, Gem, Heart } from 'doly-icons';
import SliderCaptcha from 'rc-slider-captcha';
import React from 'react';
import styles from './custom-style.less';
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
        loading: '👩🏻‍💻🧑‍💻努力中...'
      }}
      loadingBoxProps={{
        icon: <Heart />,
        text: "I'm loading"
      }}
      className={styles.custom}
    />
  );
}

export default Demo;
