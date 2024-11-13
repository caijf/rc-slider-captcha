import { inRange, sleep } from 'ut2';
import ImageBg from './assets/1bg@2x.jpg';
import ImagePuzzle from './assets/1puzzle@2x.png';

let count = 0;

export const getCaptcha = async () => {
  await sleep();

  if (++count % 2 !== 0) {
    return Promise.reject('request failed');
  }

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
