import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../middlewares/errorHandller.js';

export const verifyJwt = <T = JwtPayload>(token: string): T => {
  try {
    return jwt.verify(token, env.JWT_SECRET!) as T;
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};

export const signJwt = (
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '15m'
) => {
  return jwt.sign(payload, env.JWT_SECRET!, { expiresIn });
};
