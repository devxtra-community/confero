import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

export const redis = new Redis(env.REDIS_URL!);

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});
