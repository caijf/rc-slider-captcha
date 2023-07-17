import { sleep } from 'ut2';
import ImageBg from './assets/3bg.png';
import ImagePuzzle from './assets/3puzzle.png';

export const getCaptcha = async () => {
  await sleep();
  return {
    bgUrl: ImageBg,
    puzzleUrl: ImagePuzzle
  };
};

export const verifyCaptcha = async (data: { x: number }) => {
  await sleep();
  if (data.x && data.x > 251 && data.x < 257) {
    return Promise.resolve();
  }
  return Promise.reject();
};
