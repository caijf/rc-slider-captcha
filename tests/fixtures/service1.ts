import { waitTime } from 'util-helpers';

export const getCaptcha = async () => {
  await waitTime();
  return {
    bgUrl: 'image1',
    puzzleUrl: 'image2'
  };
};

export const verifyCaptcha = async (data: { x: number }) => {
  await waitTime();
  if (data.x && data.x > 87 && data.x < 93) {
    return Promise.resolve();
  }
  return Promise.reject();
};
