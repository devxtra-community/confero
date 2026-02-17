import { userBanRepository } from '../repositories/userBanRepository.js';
import { redis } from '../config/redis.js';

export const banService = {
  banUser: async (
    userId: string,
    reason: string,
    bannedBy?: string,
    expiresAt?: Date
  ) => {
    await userBanRepository.createBan({
      userId,
      reason,
      bannedBy,
      banType: bannedBy ? 'admin' : 'auto',
      expiresAt,
    });

    await redis.sadd('banned_users', userId);
  },

  unbanUser: async (userId: string) => {
    await userBanRepository.deactivate(userId);

    await redis.srem('banned_users', userId);
  },
};
