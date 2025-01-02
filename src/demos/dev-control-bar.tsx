/**
 * debug: true
 */
import * as React from 'react';
import { Status } from '../interface';
import ControlBar, { ControlBarRefType } from '../ControlBar';
import { Space } from 'antd';

const Demo = () => {
  const controlBarRef1 = React.useRef<ControlBarRefType>(null);
  const controlBarRef2 = React.useRef<ControlBarRefType>(null);
  const controlBarRef3 = React.useRef<ControlBarRefType>(null);
  const controlBarRef4 = React.useRef<ControlBarRefType>(null);
  const controlBarRef5 = React.useRef<ControlBarRefType>(null);
  const controlBarRef6 = React.useRef<ControlBarRefType>(null);
  const controlBarRef7 = React.useRef<ControlBarRefType>(null);
  const controlBarRef8 = React.useRef<ControlBarRefType>(null);

  React.useEffect(() => {
    controlBarRef4.current?.updateLeft(48);
    controlBarRef5.current?.updateLeft(158);
    controlBarRef6.current?.updateLeft(158);
    controlBarRef7.current?.updateLeft(48);
    controlBarRef8.current?.updateLeft(48);
  }, []);

  return (
    <Space direction="vertical" style={{ display: 'flex' }}>
      <ControlBar status={Status.Loading} controlRef={controlBarRef1} />
      <ControlBar status={Status.LoadFailed} controlRef={controlBarRef2} />
      <ControlBar status={Status.Default} controlRef={controlBarRef3} />
      <ControlBar status={Status.Moving} controlRef={controlBarRef4} />
      <ControlBar status={Status.Verify} controlRef={controlBarRef5} />
      <ControlBar status={Status.Success} controlRef={controlBarRef6} />
      <ControlBar status={Status.Error} controlRef={controlBarRef7} />
      <ControlBar status={Status.Error} controlRef={controlBarRef8} isLimitErrors />
    </Space>
  );
};

export default Demo;
