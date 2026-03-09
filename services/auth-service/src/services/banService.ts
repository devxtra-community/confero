import { userBanRepository } from '../repositories/userBanRepository.js';
import { redis } from '../config/redis.js';
import { userReportRepository } from '../repositories/userReportRepository.js';
import { AppError } from '../middlewares/errorHandller.js';

export const banService = {
  banUser: async (userId: string, reason: string, expiresAt: Date) => {
    if (!expiresAt || expiresAt.getTime() <= Date.now()) {
      throw new AppError('Invalid ban duration', 400);
    }

    await userBanRepository.createBan({
      userId,
      reason,
      expiresAt,
    });
    await userReportRepository.deleteFromReport(userId);

    const seconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);

    await redis.set(`banned:${userId}`, '1', 'EX', seconds);
  },

  unbanUser: async (userId: string) => {
    await userBanRepository.deactivate(userId);

    await redis.srem('banned_users', userId);
  },
};
