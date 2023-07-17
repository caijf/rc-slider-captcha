import { sleep } from 'ut2';

export const getCaptcha = async () => {
  await sleep();
  return {
    bgUrl: 'image1',
    puzzleUrl: 'image2'
  };
};

export const verifyCaptcha = async (data: { x: number }) => {
  await sleep();
  if (data.x && data.x > 87 && data.x < 93) {
    return Promise.resolve();
  }
  return Promise.reject();
};
