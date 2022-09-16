import { waitTime } from 'util-helpers';
import ImageBg from './assets/3bg.png';
import ImagePuzzle from './assets/3puzzle.png';

export const getCaptcha = async () => {
  await waitTime();
  return {
    bgUrl: ImageBg,
    puzzleUrl: ImagePuzzle,
  };
};

export const verifyCaptcha = async (data: { x: number }) => {
  await waitTime();
  if (data.x && data.x > 251 && data.x < 257) {
    return Promise.resolve();
  }
  return Promise.reject();
};
