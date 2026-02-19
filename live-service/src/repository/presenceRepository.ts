import redis from '../config/redis';

const PRESENCE_TTL = 90;

export const presenceRepository = {
  async addSocket(userId: string, socketId: string) {
    const key = `online:${userId}`;

    await redis.sadd(key, socketId);
    await redis.expire(key, PRESENCE_TTL);
  },

  async refresh(userId: string) {
    await redis.expire(`online:${userId}`, PRESENCE_TTL);
  },

  async removeSocket(userId: string, socketId: string) {
    const key = `online:${userId}`;

    await redis.srem(key, socketId);

    const remaining = await redis.scard(key);

    if (remaining === 0) {
      await redis.del(key);
      return true;
    }

    return false;
  },

  async isOnline(userId: string) {
    return (await redis.exists(`online:${userId}`)) === 1;
  },

  /**
   * Returns the number of active sockets for a user.
   * Used by socketMiddleware to block duplicate tab connections.
   * A count > 0 means the user already has an active socket.
   */
  async getSocketCount(userId: string): Promise<number> {
    return redis.scard(`online:${userId}`);
  },
};
