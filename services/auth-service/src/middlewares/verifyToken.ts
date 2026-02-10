import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AppError } from './errorHandller.js';
import { env } from '../config/env.js';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

// Custom JWT payload interface
interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: 'user' | 'admin';
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
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    // Extract user data directly from JWT claims - no DB lookup
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    console.log(req.user);

    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};
