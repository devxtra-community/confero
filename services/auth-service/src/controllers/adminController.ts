import { Request, Response } from 'express';
import { userBanRepository } from '../repositories/userBanRepository.js';
import { banService } from '../services/banService.js';
import { reportService } from '../services/reportService.js';
import { sessionService } from '../services/sessionService.js';
import { UserModel } from '../models/userModel.js';

export const adminDashboard = async (_req: Request, res: Response) => {
  const [sessions, totalUsers, newUsersThisWeek] = await Promise.all([
    sessionService.getAnalytics(),
    // CHANGED: no filter — count ALL documents, every registered user ever
    UserModel.countDocuments(),
    UserModel.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      sessions,
      totalUsers,
      newUsersThisWeek,
    },
  });
};

export const adminProfile = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Admin profile' });
};

export const banUser = async (req: Request, res: Response) => {
  const { userId, reason, expiresAt } = req.body;

  const expiresDate = new Date(expiresAt);
  await banService.banUser(userId, reason, expiresDate);

  res.json({
    message: 'User banned successfully',
    success: true,
  });
};

export const getBannedUsers = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  await userBanRepository.autoDeactivateExpired();
  const { data, total } = await userBanRepository.getActiveBans({
    page,
    limit,
  });
  res.json({ success: true, data, total, page, limit });
};

export const unbanUser = async (req: Request, res: Response) => {
  const { userId } = req.body;
  await banService.unbanUser(userId);
  res.json({ success: true, message: 'User unbanned successfully' });
};

export const getReportedUsers = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 4;
  const result = await reportService.getReportedUsers(page, limit);
  res.json({
    success: true,
    data: result.reports,
    pagination: result.pagination,
  });
};

export const getSessionHistory = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const { data, total } = await sessionService.getSessions(page, limit);
  res.json({ success: true, data, total, page, limit });
};
