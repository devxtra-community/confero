import bcrypt from 'bcryptjs';
import { signJwt, verifyJwt } from '../utils/jwtService.js';
import { userRepository } from '../repositories/userRepository.js';
import { AppError } from '../middlewares/errorHandller.js';
import { generateOtp } from '../utils/otp.js';
import { otpRepository } from '../repositories/otpRepository.js';
import { sendOtpMail } from '../utils/sendOtp.js';
import { logger } from '../config/logger.js';

export const authService = {
  registerUser: async (email: string, password: string, firstName: string) => {
    if (!email || !password || !firstName) {
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
      firstName,
    });

    const otp = generateOtp();
    await otpRepository.create(email, otp);
    await sendOtpMail(email, otp);

    const verificationToken = signJwt(
      {
        email,
        type: 'email_verification',
      },
      '5m'
    );
    logger.info('register and return verificationToken');
    return verificationToken;
  },

  verifyOtp: async (otp: number, verificationToken: string) => {
    const payload = verifyJwt(verificationToken);

    if (payload.type !== 'email_verification') {
      throw new AppError('Invalid verification token', 401);
    }

    const email = payload.email;

    const record = await otpRepository.find(email, otp);
    if (!record) {
      throw new AppError('Invalid or expired OTP', 403);
    }

    await userRepository.updateByEmail(email, {
      emailVerified: true,
    });

    await otpRepository.delete(email);

    return;
  },
};
