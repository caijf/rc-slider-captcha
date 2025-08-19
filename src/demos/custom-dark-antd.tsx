import React, { useState } from 'react';
import { Button, ConfigProvider, theme } from 'antd';
import SliderCaptcha from 'rc-slider-captcha';
import { getCaptcha, verifyCaptcha } from './service1';

function Demo() {
  const { token } = theme.useToken();

  return (
    <SliderCaptcha
      request={getCaptcha}
      onVerify={(data) => {
        console.log(data);
        return verifyCaptcha(data);
      }}
      style={{
        '--rcsc-bg-color': token.colorBgLayout,
        '--rcsc-text-color': token.colorText,
        '--rcsc-border-color': token.colorBorder,
        '--rcsc-button-bg-color': token.colorBgElevated
      }}
    />
  );
}

function App() {
  const [dark, setDark] = useState(true);

  return (
    <div>
      <Button type="primary" onClick={() => setDark(!dark)} style={{ marginBottom: 24 }}>
        切换主题
      </Button>
      <div style={{ padding: 24, background: dark ? 'black' : 'white' }}>
        <ConfigProvider
          theme={{
            algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm
          }}
        >
          <Demo />
        </ConfigProvider>
      </div>
    </div>
  );
}

export default App;
