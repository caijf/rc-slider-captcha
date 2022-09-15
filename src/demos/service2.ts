import { waitTime } from 'util-helpers';
import ImageBg from './assets/2bg.png';
import ImagePuzzle from './assets/2puzzle.png';

export const getCaptcha = async () => {
  await waitTime();
  return {
    bgUrl: ImageBg,
    puzzleUrl: ImagePuzzle,
    y: 31,
  };
};

export const verifyCaptcha = async (data: { x: number }) => {
  await waitTime();
  if (data.x && data.x > 187 && data.x < 193) {
    return Promise.resolve();
  }
  return Promise.reject();
};
