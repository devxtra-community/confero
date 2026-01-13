import redis from '../config/redis';

export const healthService = {
  async check() {
    const redisStatus = await redis.ping();
    return {
      status: 'ok',
      redis: redisStatus === 'PONG' ? 'Up' : 'Down',
      timeStamp: new Date().toString(),
    };
  },
};
