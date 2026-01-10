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
  console.log('reached');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Verification token missing', 401);
  }
  const verificationToken = authHeader.split(' ')[1];
  const { otp } = req.body;
  console.log(otp);
  if (!otp) {
    throw new AppError('OTP is required', 400);
  }

  await authService.verifyOtp(otp, verificationToken);

  logger.info('email verification completed');

  res.status(200).json({
    success: true,
    message: 'Email verified successfully,Registration completed',
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken } = await authService.loginUser(
    email,
    password
  );

  logger.info('Login Succesfull');

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: 'Login Successfullly Completed',
    success: true,
    accessToken,
  });
};

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;
  const result = await googleAuthService.authenticate(idToken);

  res.status(200).json({
    message: 'Google login successful',
    success: true,
    result,
  });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  await authService.logoutUser(refreshToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'strict',
    secure: true,
    path: '/auth',
  });

  res.status(200).json({
    success: true,
    message: 'Logouted successfully..',
  });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError('Invalid refresh Token', 401);
  }

  const newAccessToken = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({
    accessToken: newAccessToken,
  });
};
