import { inRange, sleep } from 'ut2';
import ImageBg from './assets/2bg.png';
import ImagePuzzle from './assets/2puzzle.png';

export const getCaptcha = async () => {
  await sleep();
  return {
    bgUrl: ImageBg,
    puzzleUrl: ImagePuzzle,
    y: 31
  };
};

export const verifyCaptcha = async (data: { x: number }) => {
  await sleep();
  // value is 190±5
  if (data && inRange(data.x, 185, 195)) {
    return Promise.resolve();
  }
  return Promise.reject();
};
