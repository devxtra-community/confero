import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandller.js';
import { logger } from '../config/logger.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  logger.error('UNEXPECTED ERROR:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};
