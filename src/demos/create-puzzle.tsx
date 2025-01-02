import SliderCaptcha, { ActionType } from 'rc-slider-captcha';
import React, { useRef, useState } from 'react';
import { Options, createPuzzle } from 'create-puzzle';
import DemoImage from './assets/sunflower.jpg';
import { Radio } from 'antd';
import { useUpdateEffect } from 'rc-hooks';

function Demo() {
  const [format, setFormat] = useState<Options['format']>('blob');
  const actionRef = useRef<ActionType>();
  const offsetXRef = useRef(0); // x 轴偏移值

  useUpdateEffect(() => {
    actionRef.current?.refresh();
  }, [format]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        图片格式：
        <Radio.Group
          buttonStyle="outline"
          optionType="button"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <Radio value="blob">Blob</Radio>
          <Radio value="dataURL">Base64</Radio>
        </Radio.Group>
      </div>
      <SliderCaptcha
        request={() =>
          createPuzzle(DemoImage, {
            format
          }).then((res) => {
            offsetXRef.current = res.x;

            return {
              bgUrl: res.bgUrl,
              puzzleUrl: res.puzzleUrl
            };
          })
        }
        onVerify={(data) => {
          console.log(data);
          if (data.x >= offsetXRef.current - 5 && data.x < offsetXRef.current + 5) {
            return Promise.resolve();
          }
          return Promise.reject();
        }}
        bgSize={{
          width: 360
        }}
        loadingDelay={300}
        actionRef={actionRef}
      />
    </div>
  );
}

export default Demo;
