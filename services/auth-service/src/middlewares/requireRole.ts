import { Response, NextFunction } from 'express';
import { AuthRequest } from './verifyToken.js';
import { AppError } from './errorHandller.js';
import { userRepository } from '../repositories/userRepository.js';

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
