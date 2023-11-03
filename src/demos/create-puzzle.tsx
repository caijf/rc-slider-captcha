/**
 * description:  使用 [`create-puzzle`](https://caijf.github.io/create-puzzle/index.html) 生成背景图和拼图。如果你使用的是 Node.js 做服务端，推荐使用 [`node-puzzle`](https://github.com/caijf/node-puzzle) 。
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
        createPuzzle(DemoImage, {
          format: 'blob'
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
