/**
 * title: 结合弹窗
 * description: 点击登录按钮显示滑块验证码弹窗，你可以在 `onVerify` 成功之后进行页面跳转或其他操作。
 */
import { Button, Modal } from 'antd';
import SliderCaptcha from 'rc-slider-captcha';
import React, { useState } from 'react';
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
        title="安全验证"
        width={368}
        footer={false}
        bodyStyle={{ padding: 20 }}
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
