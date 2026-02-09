import { Request, Response } from 'express';
import { userBanRepository } from '../repositories/userBanRepository.js';
import { redis } from '../config/redis.js';
import { banService } from '../services/banService.js';

export const adminDashboard = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Admin Dashboard',
  });
};

export const adminProfile = async (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Admin profile',
  });
};

export const banUser = async (req: Request, res: Response) => {
  const { userId, reason, expiresAt } = req.body;

  await banService.banUser(userId, reason, expiresAt);

  res.json({
    message: 'User banned successfully',
    success: true,
  });
};

export const getBannedUsers = async (_req: Request, res: Response) => {
  const bans = await userBanRepository.getActiveBans();

  res.json(bans);
};

export const unbanUser = async (req: Request, res: Response) => {
  const { userId } = req.body;

  await banService.unbanUser(userId);

  await redis.srem('banned_users', userId);

  res.json({
    success: true,
    message: 'User unbanned successfully',
  });
};
