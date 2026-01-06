import { Request, Response } from 'express';
import { authService } from '../services/authServices.js';

export const register = async (req: Request, res: Response) => {
  const { email, password, firstName } = req.body;

  await authService.registerUser(email, password, firstName);

  res.status(201).json({
    message: 'OTP sent to email',
  });
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp, password, firstName } = req.body;

  const token = await authService.verifyOtp(email, otp, password, firstName);

  res.status(200).json({
    message: 'Email verified successfully,Registration completed',
    token,
  });
};
