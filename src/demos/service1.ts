import { inRange, sleep } from 'ut2';
import ImageBg from './assets/1bg@2x.jpg';
import ImagePuzzle from './assets/1puzzle@2x.png';

export const getCaptcha = async () => {
  await sleep();
  return {
    bgUrl: ImageBg,
    puzzleUrl: ImagePuzzle
  };
};

export const verifyCaptcha = async (data: { x: number }) => {
  await sleep();
  // value is 90±5
  if (data && inRange(data.x, 85, 95)) {
    return Promise.resolve();
  }
  return Promise.reject();
};
