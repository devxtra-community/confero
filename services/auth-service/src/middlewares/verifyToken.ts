import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from './errorHandller.js';
import { env } from '../config/env.js';
import { userRepository } from '../repositories/userRepository.js';
import { Request } from 'express';
import { redis } from '../config/redis.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export const verifyAccessToken = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const userId = payload.sub as string;

    const user = await userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 401);
    }

    // check if expired
    const isBanned = (await redis.sismember('banned_users', userId)) === 1;

    if (isBanned) {
      throw new AppError('Account banned', 403);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch {
    throw new AppError(' or expired token', 401);
  }
};
