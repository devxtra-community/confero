import { Request, Response } from 'express';

export const adminDashboard = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Admin Dashboard',
  });
};

export const adminProfile = async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Admin profile',
  });
};
