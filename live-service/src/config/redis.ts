import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from './logger';

const redis = new Redis(env.REDIS_URL);
redis.on('connect', () => {
  logger.info(' Redis connected');
});

export default redis;
