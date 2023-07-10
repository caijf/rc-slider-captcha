/**
 * title: 客户端生成拼图
 * description:  使用 [`create-puzzle`](https://caijf.github.io/create-puzzle/index.html) 生成背景图和拼图。
 */
import SliderCaptcha from 'rc-slider-captcha';
import React, { useRef } from 'react';
import { randomInt } from 'ut2';
import createPuzzle from 'create-puzzle';
import DemoImage from './assets/sunflower.jpg';

function Demo() {
  const offsetXRef = useRef(0); // x 轴偏移值

  return (
    <SliderCaptcha
      request={() =>
        createPuzzle(DemoImage, {
          x: randomInt(80, 300)
        }).then((res) => {
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
      loadingDelay={300}
    />
  );
}

export default Demo;
