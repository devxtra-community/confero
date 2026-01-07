import { Request, Response } from 'express';
import { authService } from '../services/authServices.js';
import { logger } from '../config/logger.js';

export const register = async (req: Request, res: Response) => {
  const { email, password, firstName } = req.body;

  const verificationToken = await authService.registerUser(
    email,
    password,
    firstName
  );

  logger.info('otp send to email...');

  res.status(201).json({
    message: 'OTP sent to email',
    verificationToken,
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { otp, verificationToken } = req.body;

  await authService.verifyOtp(otp, verificationToken);

  logger.info('email verification completed..');

  res.status(200).json({
    message: 'Email verified successfully,Registration completed',
  });
};
