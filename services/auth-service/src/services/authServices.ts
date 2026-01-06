import bcrypt from 'bcryptjs';
import { signJwt } from '../utils/jwtService.js';
import { userRepository } from '../repositories/userRepository.js';
import { AppError } from '../middlewares/errorHandller.js';
import { generateOtp } from '../utils/otp.js';
import { otpRepository } from '../repositories/otpRepository.js';
import { sendOtpMail } from '../utils/sendOtp.js';

export const authService = {
  registerUser: async (email: string, password: string, firstName: string) => {
    if (!email || !password || !firstName) {
      throw new AppError('All fields  are required', 400);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const otp = generateOtp();

    await otpRepository.create(email, otp);
    await sendOtpMail(email, otp);

    return;
  },

  verifyOtp: async (
    email: string,
    otp: number,
    password: string,
    firstName: string
  ) => {
    const record = await otpRepository.find(email, otp);
    if (!record) {
      throw new AppError('Invalid or expired OTP', 403);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      email,
      password: hashedPassword,
      firstName,
    });

    await otpRepository.delete(email);

    const token = signJwt({
      userId: user._id,
      type: 'auth',
    });

    return token;
  },
};
