import { waitTime } from 'util-helpers';
import ImageBg from './bg@2x.jpeg';
import ImagePuzzle from './puzzle@2x.png';

export const getCaptcha = async () => {
  await waitTime();
  return {
    bgUrl: ImageBg,
    puzzleUrl: ImagePuzzle,
  };
};

export const verifyCaptcha = async (data: { x: number }) => {
  await waitTime();
  if (data.x && data.x > 87 && data.x < 93) {
    return Promise.resolve();
  }
  return Promise.reject();
};
