import { Request, Response } from 'express';
import { authService } from '../services/authServices.js';
import { googleAuthService } from '../services/googleAuth.service.js';
import { logger } from '../config/logger.js';
import { AppError } from '../middlewares/errorHandller.js';

/**
 * Shared cookie options for refresh token
 */
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * REGISTER (Email + Password)
 */
export const register = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;

  if (!email || !password || !fullName) {
    throw new AppError('All fields are required', 400);
  }

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

/**
 * VERIFY OTP
 */
export const verifyOtp = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Verification token missing', 401);
  }

  const verificationToken = authHeader.split(' ')[1];
  const { otp } = req.body;

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

/**
 * LOGIN (Email + Password)
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } =
    await authService.loginUser(email, password);

  logger.info('Login successful');

  // 🔐 Set refresh token in HTTP-only cookie
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  // ✅ Send access token in response
  res.status(200).json({
    success: true,
    message: 'Login successfully completed',
    user,
    accessToken,
  });
};

/**
 * LOGIN WITH GOOGLE
 */
export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError('Google ID token is required', 400);
  }

  const { user, accessToken, refreshToken } =
    await googleAuthService.authenticate(idToken);

  logger.info('Google login successful');

  // 🔐 Same refresh token cookie as normal login
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

  // ✅ Same response shape as normal login
  res.status(200).json({
    success: true,
    message: 'Google login successfully completed',
    user,
    accessToken,
  });
};
