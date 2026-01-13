import Redis from 'ioredis';
import { env } from '../config/env';

const redis = new Redis(env.REDIS_URL);
redis.on('connect', () => {
  console.log(' Redis connected');
});

export default redis;
