import { waitTime } from 'util-helpers';
import ImageBg from './assets/1bg@2x.jpg';
import ImagePuzzle from './assets/1puzzle@2x.png';

export const getCaptcha = async () => {
  await waitTime();
  return {
    bgUrl: ImageBg,
    puzzleUrl: ImagePuzzle
  };
};

export const verifyCaptcha = async (data: { x: number }) => {
  await waitTime();
  if (data.x && data.x > 87 && data.x < 93) {
    return Promise.resolve();
  }
  return Promise.reject();
};
