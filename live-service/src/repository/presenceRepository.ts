import redis from '../config/redis';

export const presenceRepository = {
  setOnline(userId: string, socketId: string) {
    return redis.set(`online : ${userId}`, socketId, 'EX', 60);
  },
  remove(userId: string) {
    return redis.del(`online:${userId}`);
  },
};
