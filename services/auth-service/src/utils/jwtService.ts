import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { AppError } from '../middlewares/errorHandller.js';


export const signJwt = (
  payload: object,
  expiresIn: SignOptions['expiresIn'] = '15m'
): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

export const verifyJwt = <T = JwtPayload>(token: string): T => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as T;
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};



export const generateAccessToken = (userId: string, email: string): string => {
  return signJwt(
    {
      sub: userId,
      email,
      type: 'access',
    },
    '15m'
  );
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

export const hashRefreshToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
