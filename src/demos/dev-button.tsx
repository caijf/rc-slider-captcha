/**
 * debug: true
 */
import * as React from 'react';
import SliderButton from '../SliderButton';
import SliderIcon from '../SliderIcon';

function Demo() {
  return (
    <>
      默认:{' '}
      <SliderButton>
        <SliderIcon type="arrowRight" />
      </SliderButton>
      <br />
      禁用:{' '}
      <SliderButton disabled>
        <SliderIcon type="arrowRight" />
      </SliderButton>
      <br />
      激活:{' '}
      <SliderButton active>
        <SliderIcon type="arrowRight" />
      </SliderButton>
      <br />
      验证:{' '}
      <SliderButton verify>
        <SliderIcon type="loading" spin />
      </SliderButton>
      <br />
      成功:{' '}
      <SliderButton success>
        <SliderIcon type="check" />
      </SliderButton>
      <br />
      失败:{' '}
      <SliderButton error>
        <SliderIcon type="x" />
      </SliderButton>
    </>
  );
}

export default Demo;
