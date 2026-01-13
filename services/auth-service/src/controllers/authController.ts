import { Request, Response } from 'express';
import { authService } from '../services/authServices.js';
import { googleAuthService } from '../services/googleAuth.service.js';
import { logger } from '../config/logger.js';
import { AppError } from '../middlewares/errorHandller.js';

/**
 * REGISTER (Email + Password)
 */
export const register = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  const verificationToken = await authService.registerUser(
    email,
    password,
    fullName
  );

  logger.info('OTP sent to email');

  res.status(201).json({
    success: true,
    message: 'OTP sent to email',
    verificationToken,
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

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

  logger.info('Email verification completed');

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. Registration completed',
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
    message: ' Login Successfully Completed',
    success: true,
    accessToken,
  });
};

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  const { accessToken, refreshToken } =
    await googleAuthService.authenticate(idToken);

  logger.info('Google login successful');

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: true,
    path: '/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Google login successfully completed',
    accessToken,
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
