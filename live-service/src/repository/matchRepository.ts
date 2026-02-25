import redis from '../config/redis';
import { MatchSession } from '../matching/matchingTypes';

const stateKey = (userId: string) => `match:state:${userId}`;
const queueKey = (skill: string) => `match:queue:${skill}`;
const sessionKey = (sessionId: string) => `match:session:${sessionId}`;

export const matchingRepository = {
  getState(userId: string) {
    return redis.get(stateKey(userId));
  },

  setState(userId: string, state: string) {
    return redis.set(stateKey(userId), state, 'EX', 120);
  },

  popQueueBySkill(skill: string) {
    return redis.lpop(queueKey(skill));
  },

  async pushQueueOnce(skill: string, userId: string) {
    const key = queueKey(skill);
    const exists = await redis.lpos(key, userId);
    if (exists === null) {
      await redis.rpush(key, userId);
    }
  },

  async removeUserFromAllQueues(userId: string) {
    const keys = await redis.keys('match:queue:*');
    for (const key of keys) {
      await redis.lrem(key, 0, userId);
    }
  },

  createSession(session: MatchSession) {
    return redis.hset(sessionKey(session.sessionId), session as any);
  },
  async deleteSession(userId: string) {
    // find and delete the session where userA or userB is this userId
    const keys = await redis.keys('match:session:*');
    for (const key of keys) {
      const raw = await redis.get(key);
      if (!raw) continue;
      const session = JSON.parse(raw);
      if (session.userA === userId || session.userB === userId) {
        await redis.del(key);
      }
    }
  },
};
