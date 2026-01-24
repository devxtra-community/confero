import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from './errorHandller.js';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const verifyAccessToken = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    console.log("JWT decoded payload:", payload);

    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
    };

    console.log("req.user after middleware:", req.user);

    next();
  } catch (err) {
    console.error("JWT verify failed:", err);
    throw new AppError('Invalid or expired token', 401);
  }
};
