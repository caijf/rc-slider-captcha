import { sleep } from 'ut2';
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
  if (data?.x && data.x > 87 && data.x < 93) {
    return Promise.resolve();
  }
  return Promise.reject();
};

export default {};
