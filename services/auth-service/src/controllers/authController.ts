import { Request, Response } from 'express';
import { authService } from '../services/authServices.js';
import { googleAuthService } from '../services/googleAuth.service.js';
import { logger } from '../config/logger.js';
import { AppError } from '../middlewares/errorHandller.js';
import { authSessionRepository } from '../repositories/authSessionRepository.js';
import { hashRefreshToken } from '../utils/jwtService.js';
import { redis } from '../config/redis.js';

const isProduction = process.env.NODE_ENV === 'production';

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

  const { accessToken, refreshToken, role } = await authService.loginUser(
    email,
    password
  );

  logger.info('Login Succesfull');

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    domain: 'localhost',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    domain: 'localhost',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    message: ' Login Successfully Completed',
    success: true,
    role,
  });
};

export const resendOtp = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Verification token missing', 401);
  }

  const verificationToken = authHeader.split(' ')[1];

  await authService.resendOtp(verificationToken);

  res.status(200).json({
    success: true,
    message: 'OTP resent successfully',
  });
};

export const googleLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  const { accessToken, refreshToken } =
    await googleAuthService.authenticate(idToken);

  logger.info('Google login successful');

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    domain: 'localhost',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    domain: 'localhost',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Google login successfully completed',
  });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    try {
      const refreshTokenHash = hashRefreshToken(refreshToken);
      const session =
        await authSessionRepository.findValidByTokenHash(refreshTokenHash);

      if (session) {
        const userId = session.userId.toString();

        await Promise.all([
          redis.del(`online:${userId}`),
          redis.del(`match:state:${userId}`),
          redis.del(`match:searching:${userId}`),
          redis.del(`match:incall:${userId}`),
        ]);

        logger.info(`Redis cleaned for user ${userId} on logout`);
      }
    } catch (err) {
      logger.error('Redis cleanup failed during logout', err);
    }
  }

  await authService.logoutUser(refreshToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  });

  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
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

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });

  res.status(200).json({
    message: 'refresh succesfully',
  });
};

export const forgotPassword = async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);

  res.json({
    message: 'Check your email and reset the password through link',
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  await authService.resetPassword(token, newPassword);
  res.json({ message: 'Password updated successfully' });
};