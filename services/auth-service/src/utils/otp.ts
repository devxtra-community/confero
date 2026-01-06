import { randomInt } from 'crypto';

export const generateOtp = (): number => {
  return randomInt(100000, 1000000);
};
