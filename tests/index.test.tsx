/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import React, { act } from 'react';
import { getCaptcha, verifyCaptcha } from './fixtures/service1';
import SliderCaptcha from '..';

describe('snapshot', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  test('default mode', async () => {
    const component = render(<SliderCaptcha request={getCaptcha} onVerify={verifyCaptcha} />);

    expect(component.asFragment()).toMatchSnapshot();

    await act(() => {
      jest.runAllTimers();
    });

    expect(component.asFragment()).toMatchSnapshot();

    await act(() => {
      component.rerender(
        <SliderCaptcha request={getCaptcha} onVerify={verifyCaptcha} showRefreshIcon={false} />
      );
    });

    expect(component.asFragment()).toMatchSnapshot();
  });

  test('float mode', async () => {
    const component = render(
      <SliderCaptcha request={getCaptcha} onVerify={verifyCaptcha} mode="float" />
    );
    expect(component.asFragment()).toMatchSnapshot();

    await act(() => {
      jest.runAllTimers();
    });

    expect(component.asFragment()).toMatchSnapshot();

    await act(() => {
      component.rerender(
        <SliderCaptcha
          request={getCaptcha}
          onVerify={verifyCaptcha}
          mode="float"
          placement="bottom"
        />
      );
    });

    expect(component.asFragment()).toMatchSnapshot();
  });

  test('slider mode', () => {
    const component = render(<SliderCaptcha onVerify={verifyCaptcha} mode="slider" />);
    expect(component.asFragment()).toMatchSnapshot();
  });

  test('custom config', async () => {
    const component = render(
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
        styles={{
          panel: { color: 'red' },
          jigsaw: { backgroundColor: 'green' },
          bgImg: { borderRadius: 5 },
          puzzleImg: { color: 'blue' },
          control: { fontSize: 20 },
          indicator: { backgroundColor: 'black' }
        }}
      />
    );

    expect(component.asFragment()).toMatchSnapshot();

    await act(() => {
      jest.runAllTimers();
    });

    expect(component.asFragment()).toMatchSnapshot();
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
    const controlEl = container.querySelector('.rc-slider-captcha-control') as HTMLElement;

    expect(container).toContainElement(wrapperEl);
    expect(wrapperEl).toContainElement(panelEl);
    expect(wrapperEl).toContainElement(controlEl);

    expect(container.querySelector('.rc-slider-captcha-loading')).toBeInTheDocument();
    expect(container.querySelector('.rc-slider-captcha-jigsaw')).not.toBeInTheDocument();
    expect(controlEl.querySelector('.rc-slider-captcha-control-tips')).toHaveTextContent(
      '加载中...'
    );

    await act(() => {
      jest.runAllTimers();
    });

    expect(container.querySelector('.rc-slider-captcha-loading')).not.toBeInTheDocument();
    expect(container.querySelector('.rc-slider-captcha-jigsaw')).toBeInTheDocument();
    expect(controlEl.querySelector('.rc-slider-captcha-control-tips')).toHaveTextContent(
      '向右拖动滑块填充拼图'
    );
  });
});
