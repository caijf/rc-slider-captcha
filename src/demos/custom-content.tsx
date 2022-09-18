import SliderCaptcha from 'rc-slider-captcha';
import React, { useState } from 'react';
import styles from './custom-content.less';
import { getCaptcha, verifyCaptcha } from './service1';

function Demo() {
  const [visible, setVisible] = useState(false);
  const [duration, setDuration] = useState(0);

  return (
    <SliderCaptcha
      request={getCaptcha}
      onVerify={(data) => {
        console.log(data);
        return verifyCaptcha(data).then(() => {
          setDuration(data.duration);
          setVisible(true);
        });
      }}
      className={styles.custom}
      jigsawContent={
        visible && (
          <div className={styles.successTip}>
            {Number((duration / 1000).toFixed(2))}秒内完成，打败了xx%用户
          </div>
        )
      }
    />
  );
}

export default Demo;
