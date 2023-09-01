/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '@testing-library/jest-dom';
import renderer from 'react-test-renderer';
import { render, act, waitFor } from '@testing-library/react';
import React from 'react';
import { getCaptcha, verifyCaptcha } from './fixtures/service1';
import SliderCaptcha from '..';

describe('snapshot', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('render default, float mode, slider mode, refresh icon, other', async () => {
    const component = renderer.create(
      <SliderCaptcha request={getCaptcha} onVerify={verifyCaptcha} />
    );

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // float mode
    renderer.act(() => {
      component.update(
        <SliderCaptcha request={getCaptcha} onVerify={verifyCaptcha} mode="float" />
      );
    });

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // slider mode
    renderer.act(() => {
      component.update(<SliderCaptcha onVerify={verifyCaptcha} mode="slider" />);
    });

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // showRefreshIcon={false}
    renderer.act(() => {
      component.update(
        <SliderCaptcha request={getCaptcha} onVerify={verifyCaptcha} showRefreshIcon={false} />
      );
    });

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();

    // other props
    renderer.act(() => {
      component.update(
        <SliderCaptcha
          request={getCaptcha}
          onVerify={verifyCaptcha}
          bgSize={{
            width: 500,
            height: 200
          }}
          puzzleSize={{
            width: 50,
            height: 50,
            top: 200,
            left: 20
          }}
          tipText={{
            default: 'define default',
            loading: 'define loading',
            errors: 'define errors'
          }}
          tipIcon={{
            default: 'define icon default',
            loading: 'define icon loading',
            error: 'define icon error',
            success: 'define icon success',
            refresh: 'define icon refresh'
          }}
          loadingBoxProps={{
            text: 'define text',
            icon: 'define icon'
          }}
          className="test"
          style={{ background: 'red' }}
        />
      );
    });

    tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('render', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('render default', async () => {
    const { container } = render(<SliderCaptcha request={getCaptcha} onVerify={verifyCaptcha} />);

    // console.log(container.innerHTML);
    // console.log(container.querySelector('.rc-slider-captcha-loading')?.getAttribute('style'));

    const wrapperEl = container.querySelector('.rc-slider-captcha') as HTMLElement;
    const panelEl = container.querySelector('.rc-slider-captcha-panel') as HTMLElement;
    const jigsawEl = container.querySelector('.rc-slider-captcha-jigsaw') as HTMLElement;
    const loadingEl = container.querySelector('.rc-slider-captcha-loading') as HTMLElement;
    const controlEl = container.querySelector('.rc-slider-captcha-control') as HTMLElement;

    expect(container).toContainElement(wrapperEl);
    expect(wrapperEl).toContainElement(panelEl);
    expect(panelEl).toContainElement(jigsawEl);
    expect(panelEl).toContainElement(loadingEl);
    expect(container).toContainElement(controlEl);

    // 初始化时隐藏拼图，显示加载视图
    expect(jigsawEl.getAttribute('style')).toMatch('display: none');
    expect(loadingEl.getAttribute('style')).not.toMatch('display: none');
    expect(controlEl.querySelector('.rc-slider-captcha-control-tips')?.innerHTML).toBe('加载中...');

    act(() => {
      jest.runAllTimers();
    });

    await waitFor(() => {
      expect(jigsawEl.getAttribute('style')).not.toMatch('display: none');
      expect(loadingEl.getAttribute('style')).toMatch('display: none');
      expect(controlEl.querySelector('.rc-slider-captcha-control-tips')?.innerHTML).toBe(
        '向右拖动滑块填充拼图'
      );
    });
  });
});
