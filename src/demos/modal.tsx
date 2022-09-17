import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import SliderCaptcha from 'rc-slider-captcha';
import { getCaptcha, verifyCaptcha } from './service1';

function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ width: 320 }}>
        <div>用户名: xxx</div>
        <div>密码: xxx</div>
        <Button type="primary" block onClick={() => setOpen(true)}>
          登录
        </Button>
      </div>
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={false}
        width={368}
        title="安全验证"
      >
        <SliderCaptcha
          request={getCaptcha}
          onVerify={(data) => {
            console.log(data);
            return verifyCaptcha(data);
          }}
        />
      </Modal>
    </>
  );
}

export default Demo;
