import { Response, NextFunction } from 'express';
import { AppError } from './errorHandller.js';
import { userRepository } from '../repositories/userRepository.js';
import { AuthRequest } from './verifyToken.js';

export const requireRole = (role: 'admin') => {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await userRepository.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== role) {
      throw new AppError('Forbidden', 403);
    }

    next();
  };
};

export const requireAdminRole = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401);
  }

  if (req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403);
  }

  next();
};
