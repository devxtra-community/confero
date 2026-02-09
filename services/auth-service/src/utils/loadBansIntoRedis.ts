import { logger } from '../config/logger.js';
import { redis } from '../config/redis.js';
import { userBanRepository } from '../repositories/userBanRepository.js';

export const loadBansIntoRedis = async () => {
  const bans = await userBanRepository.getActiveBans();

  for (const ban of bans) {
    await redis.sadd('banned_users', ban.userId.toString());
  }

  logger.info('All banned users added into redis...');
};
