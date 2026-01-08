import { OAuth2Client } from 'google-auth-library';
import { AppError } from '../middlewares/errorHandller.js';
import { userRepository } from '../repositories/userRepository.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from '../utils/jwtService.js';
import { authSessionRepository } from '../repositories/authSessionRepository.js';
import { logger } from '../config/logger.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthService = {
  authenticate: async (idToken: string) => {
    if (!idToken) {
      throw new AppError('Google token required', 400);
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      throw new AppError('Invalid Google token', 401);
    }

    const {
      email,
      given_name,
      family_name,
      picture,
      sub: googleId,
    } = payload;

    let user = await userRepository.findByEmail(email);

    // --- CASE 1: Existing LOCAL user tries Google login
    if (user && user.authProvider === 'local') {
      throw new AppError(
        'Email already registered with password login',
        409
      );
    }

    // --- CASE 2: New Google user
    if (!user) {
      user = await userRepository.create({
        email,
        fullName: given_name || 'User',
        password: undefined,
        emailVerified: true,
        authProvider: 'google',
        googleId,
        profilePicture: picture,
      } as any);
    }

    // --- SESSION HANDLING (reuse existing logic)
    await authSessionRepository.revokeAllForUser(user._id);

    const userId = user._id.toString();

    const accessToken = generateAccessToken(userId, user.email);
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    await authSessionRepository.create({
      userId: user._id,
      refreshTokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user: {
        id: userId,
        email: user.email,
        firstName: user.fullName,
      },
      accessToken,
      refreshToken,
    };
  },
};
