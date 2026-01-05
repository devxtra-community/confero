import { Request, Response } from 'express';
import { authService } from '../services/auth.services.js';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.registerUser(email, password);
  res.status(201).json(result);
};
