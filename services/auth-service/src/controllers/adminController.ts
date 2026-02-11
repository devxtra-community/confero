import { Request, Response } from 'express';
import { userBanRepository } from '../repositories/userBanRepository.js';
import { redis } from '../config/redis.js';
import { banService } from '../services/banService.js';
import { reportService } from '../services/reportService.js';

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

export const getBannedUsers = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const { data, total } = await userBanRepository.getActiveBans({
    page,
    limit,
  });

  res.json({
    success: true,
    data,
    total,
    page,
    limit,
  });
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

export const getReportedUsers = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 6;

  const result = await reportService.getReportedUsers(page, limit);

  res.json({
    success: true,
    data: result.reports,
    pagination: result.pagination,
  });
};
