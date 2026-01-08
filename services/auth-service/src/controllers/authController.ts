import { Request, Response } from 'express';
import { authService } from '../services/authServices.js';
import { logger } from '../config/logger.js';
import { googleAuthService } from '../services/googleAuth.service.js';
import { AppError } from '../middlewares/errorHandller.js';

export const register = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  const verificationToken = await authService.registerUser(
    email,
    password,
    fullName
  );

  logger.info('otp send to email...');

  res.status(201).json({
    message: 'OTP sent to email',
    verificationToken,
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  console.log("reached")

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Verification token missing', 401);
  }
  const verificationToken = authHeader.split(' ')[1];
  const { otp } = req.body;

  if (!otp) {
    throw new AppError('OTP is required', 400);
  }

  await authService.verifyOtp(otp, verificationToken);

  logger.info('email verification completed');

  res.status(200).json({
    success:true,
    message: 'Email verified successfully,Registration completed',
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.loginUser(email, password);

  logger.info('Login Succesfull');

  res.status(200).json({
    message: 'Login Successfullly Completed',
    success: true,
    result,
  });
};

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  // console.log("1")
  const result = await googleAuthService.authenticate(idToken);

  res.status(200).json({
    message: 'Google login successful',
    success: true,
    result,
  });
};
