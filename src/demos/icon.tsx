/**
 * debug: true
 * title: 图标
 */
import * as React from 'react';
import SliderIcon from '../SliderIcon';

function Demo() {
  return (
    <>
      <SliderIcon type="arrowRight" />
      <SliderIcon type="check" />
      <SliderIcon type="loading" spin />
      <SliderIcon type="refresh" />
      <SliderIcon type="x" />
    </>
  );
}

export default Demo;
