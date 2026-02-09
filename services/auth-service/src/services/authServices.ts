import bcrypt from 'bcryptjs';
import { signJwt, verifyJwt } from '../utils/jwtService.js';
import { userRepository } from '../repositories/userRepository.js';
import { AppError } from '../middlewares/errorHandller.js';
import { generateOtp } from '../utils/otp.js';
import { otpRepository } from '../repositories/otpRepository.js';
import { sendOtpMail, sendResetPasswordEmail } from '../utils/sendOtp.js';
import { logger } from '../config/logger.js';
import Crypto from 'crypto';

import { authSessionRepository } from '../repositories/authSessionRepository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../utils/jwtService.js';
import { generateResetToken } from '../utils/resetToken.js';
import { env } from '../config/env.js';

export const authService = {
  registerUser: async (email: string, password: string, fullName: string) => {
    if (!email || !password || !fullName) {
      throw new AppError('All fields are required', 400);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userRepository.create({
      email,
      password: hashedPassword,
      fullName,
    });

    const otp = generateOtp().toString();
    await otpRepository.create(email, otp);
    await sendOtpMail(email, otp);

    const verificationToken = signJwt(
      {
        email,
        type: 'email_verification',
      },
      '15m'
    );

    logger.info('register and return verificationToken');
    return verificationToken;
  },

  verifyOtp: async (otp: string, verificationToken: string) => {
    const payload = verifyJwt(verificationToken);

    const email = payload.email;

    const record = await otpRepository.find(email, otp);

    if (!record) {
      throw new AppError('Invalid or expired OTP', 403);
    }

    await userRepository.updateByEmail(email, {
      emailVerified: true,
    });

    await otpRepository.delete(email);
  },

  resendOtp: async (verificationToken: string) => {
    const payload = verifyJwt(verificationToken);

    const email = payload.email.toLowerCase().trim();

    const user = await userRepository.findByEmail(email);
    if (user?.emailVerified) {
      throw new AppError('Email already verified', 400);
    }

    await otpRepository.delete(email);

    const otp = generateOtp().toString();

    await otpRepository.create(email, otp);

    await sendOtpMail(email, otp);

    await userRepository.updateByEmail(email, {
      emailVerified: true,
    });

    return;
  },

  loginUser: async (email: string, password: string) => {
    if (!email || !password) {
      throw new AppError('All fields required', 400);
    }

    const user = await userRepository.findByEmail(email);

    if (!user || !user.password) {
      throw new AppError('User not found', 401);
    }

    if (!user.emailVerified) {
      throw new AppError('Email not verified', 403);
    }

    // if (user.accountStatus !== 'active') {
    //   throw new AppError('Account is not active', 403);
    // }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new AppError('Incorrect Password', 401);
    }

    const userId = user._id.toString();

    const accessToken = generateAccessToken(userId, user.email, user.role);

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    await authSessionRepository.create({
      userId: user._id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await userRepository.updateLastLogin(userId);

    return {
      accessToken,
      refreshToken,
      role: user.role,
    };
  },

  logoutUser: async (refreshToken?: string) => {
    if (!refreshToken) {
      throw new AppError('Refresh token is missing', 400);
    }
    const refreshTokenHash = hashRefreshToken(refreshToken);
    await authSessionRepository.deleteByRefreshTokenHash(refreshTokenHash);
    return true;
  },

  refreshAccessToken: async (refreshToken: string) => {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const session =
      await authSessionRepository.findValidByTokenHash(refreshTokenHash);
    console.log(session);
    if (!session) {
      throw new AppError('Invalid refresh token', 401);
    }
    const userId = session.userId.toString();

    if (session.expiresAt < new Date()) {
      throw new AppError('Refresh token expired', 401);
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return generateAccessToken(user._id.toString(), user.email, user.role);
  },

  forgotPassword: async (email: string) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('user is not found', 404);
    }

    const { rawToken, hashedToken } = generateResetToken();

    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await userRepository.saveResetToken(user.id, hashedToken, expires);

    const resetLink = `${env.FRONTEND_URI}/reset-password?token=${rawToken}`;

    await sendResetPasswordEmail(user.email, resetLink);
  },

  resetPassword: async (token: string, newPassword: string) => {
    const hashedToken = Crypto.createHash('sha256').update(token).digest('hex');

    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw new AppError('Invalid or expired link', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await userRepository.updatePassword(user.id, hashedPassword);
  },
};
