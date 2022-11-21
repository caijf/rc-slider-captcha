/**
 * debug: true
 * title: 滑轨
 */
import classnames from 'classnames';
import * as React from 'react';
import '../style';
import SliderButton from '../SliderButton';
import SliderIcon from '../SliderIcon';
import { prefixCls } from '../utils';

const currentPrefixCls = `${prefixCls}-control`;

const Demo = () => {
  return (
    <div>
      <div className={classnames(currentPrefixCls, `${currentPrefixCls}-loading`)}>
        <div className={classnames(`${currentPrefixCls}-indicator`)} />
        <SliderButton className={`${currentPrefixCls}-button`} disabled>
          <SliderIcon type="arrowRight" />
        </SliderButton>
        <div className={classnames(`${currentPrefixCls}-tips`)}>加载中...</div>
      </div>
      <br />
      <div className={classnames(currentPrefixCls)}>
        <div className={classnames(`${currentPrefixCls}-indicator`)} />
        <SliderButton className={`${currentPrefixCls}-button`}>
          <SliderIcon type="arrowRight" />
        </SliderButton>
        <div className={classnames(`${currentPrefixCls}-tips`)}>向右拖动滑块填充拼图</div>
      </div>
      <br />
      <div className={classnames(currentPrefixCls, `${currentPrefixCls}-moving`)}>
        <div className={classnames(`${currentPrefixCls}-indicator`)} style={{ width: '90px' }} />
        <SliderButton className={`${currentPrefixCls}-button`} active style={{ left: '48px' }}>
          <SliderIcon type="arrowRight" />
        </SliderButton>
        <div className={classnames(`${currentPrefixCls}-tips`)}></div>
      </div>
      <br />
      <div className={classnames(currentPrefixCls, `${currentPrefixCls}-verify`)}>
        <div className={classnames(`${currentPrefixCls}-indicator`)} style={{ width: '200px' }} />
        <SliderButton className={`${currentPrefixCls}-button`} verify style={{ left: '158px' }}>
          <SliderIcon type="loading" spin />
        </SliderButton>
        <div className={classnames(`${currentPrefixCls}-tips`)}></div>
      </div>
      <br />
      <div className={classnames(currentPrefixCls, `${currentPrefixCls}-success`)}>
        <div className={classnames(`${currentPrefixCls}-indicator`)} style={{ width: '200px' }} />
        <SliderButton
          className={`${currentPrefixCls}-button`}
          active
          success
          style={{ left: '158px' }}
        >
          <SliderIcon type="check" />
        </SliderButton>
        <div className={classnames(`${currentPrefixCls}-tips`)}></div>
      </div>
      <br />
      <div className={classnames(currentPrefixCls, `${currentPrefixCls}-error`)}>
        <div className={classnames(`${currentPrefixCls}-indicator`)} style={{ width: '90px' }} />
        <SliderButton
          className={`${currentPrefixCls}-button`}
          active
          error
          style={{ left: '48px' }}
        >
          <SliderIcon type="x" />
        </SliderButton>
        <div className={classnames(`${currentPrefixCls}-tips`)}></div>
      </div>
      <br />
      <div
        className={classnames(
          currentPrefixCls,
          `${currentPrefixCls}-error`,
          `${currentPrefixCls}-errors`
        )}
      >
        <div className={classnames(`${currentPrefixCls}-indicator`)} />
        <SliderButton className={`${currentPrefixCls}-button`}>
          <SliderIcon type="arrowRight" />
        </SliderButton>
        <div className={classnames(`${currentPrefixCls}-tips`)}>
          <SliderIcon type="x" style={{ fontSize: 20 }} /> 失败过多，点击重试
        </div>
      </div>
    </div>
  );
};

export default Demo;
