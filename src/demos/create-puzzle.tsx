/**
 * title: 客户端生成拼图
 * description:  使用 `create-puzzle` 生成背景图和拼图。
 */
import SliderCaptcha from 'rc-slider-captcha';
import React, { useRef } from 'react';
import createPuzzle from 'create-puzzle';
import DemoImage from './assets/sunflower.jpg';

function Demo() {
  const offsetXRef = useRef(0); // x 轴偏移值

  return (
    <SliderCaptcha
      request={() =>
        createPuzzle(DemoImage).then((res) => {
          offsetXRef.current = res.x;

          return {
            bgUrl: res.bgUrl,
            puzzleUrl: res.puzzleUrl
          };
        })
      }
      onVerify={async (data) => {
        console.log(data);
        if (data.x >= offsetXRef.current - 5 && data.x < offsetXRef.current + 5) {
          return Promise.resolve();
        }
        return Promise.reject();
      }}
      bgSize={{
        width: 360
      }}
    />
  );
}

export default Demo;
