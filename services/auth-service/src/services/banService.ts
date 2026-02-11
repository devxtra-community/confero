import { userBanRepository } from '../repositories/userBanRepository.js';
import { redis } from '../config/redis.js';
import { userReportRepository } from '../repositories/userReportRepository.js';

export const banService = {
  banUser: async (userId: string, reason: string, expiresAt?: Date) => {
    await userBanRepository.createBan({
      userId,
      reason,
      expiresAt,
    });
    await userReportRepository.deleteFromReport(userId);
    await redis.sadd('banned_users', userId);
  },

  unbanUser: async (userId: string) => {
    await userBanRepository.deactivate(userId);

    await redis.srem('banned_users', userId);
  },
};
