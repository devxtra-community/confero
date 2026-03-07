import redis from '../config/redis';

const PRESENCE_TTL = 90;
const SEARCHING_TTL = 300;
const INCALL_TTL = 7200;

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

  async getSocketCount(userId: string): Promise<number> {
    return redis.scard(`online:${userId}`);
  },

  async setSearching(userId: string, socketId: string): Promise<boolean> {
    const result = await redis.set(
      `match:searching:${userId}`,
      socketId,
      'EX',
      SEARCHING_TTL,
      'NX'
    );
    return result === 'OK';
  },

  async clearSearching(userId: string): Promise<void> {
    await redis.del(`match:searching:${userId}`);
  },

  async getSearchingSocketId(userId: string): Promise<string | null> {
    return redis.get(`match:searching:${userId}`);
  },

  async setInCall(userId: string, callId: string): Promise<void> {
    await redis.set(`match:incall:${userId}`, callId, 'EX', INCALL_TTL);
  },

  async clearInCall(userId: string): Promise<void> {
    await redis.del(`match:incall:${userId}`);
  },

  async getInCallId(userId: string): Promise<string | null> {
    return redis.get(`match:incall:${userId}`);
  },

  async getOnlineCount(): Promise<number> {
    let cursor = '0';
    let count = 0;
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        'online:*',
        'COUNT',
        100
      );
      cursor = nextCursor;
      count += keys.length;
    } while (cursor !== '0');
    return count;
  },

  async getInCallCount(): Promise<number> {
    let cursor = '0';
    let count = 0;
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        'MATCH',
        'match:incall:*',
        'COUNT',
        100
      );
      cursor = nextCursor;
      count += keys.length;
    } while (cursor !== '0');
    return count;
  },
  // ─────────────────────────────────────────────────────────────────────────
};
