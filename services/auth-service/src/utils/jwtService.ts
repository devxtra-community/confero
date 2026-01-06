import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signJwt = (payload: object) => {
  return jwt.sign(payload, env.JWT_SECRET!, { expiresIn: '15m' });
};
