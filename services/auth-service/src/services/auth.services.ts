import bcrypt from 'bcryptjs';
import { signJwt } from './jwtService.js';
import { userRepository } from '../repositories/user.repository.js';
// import { env } from '../config/env.js';
import { AppError } from '../errors/app.error.js';

export const authService = {
  registerUser: async (email: string, password: string) => {
    const existingUser = await userRepository.findByEmail(email);
    if (!existingUser) {
      throw new AppError('user already exists..', 409);
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await userRepository.create({
      email,
      password: hashPassword,
    });

    const token = signJwt({ userId: user._id });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    };
  },
};
