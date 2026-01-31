import redis from '../config/redis';
import { MatchSession } from '../matching/matchingTypes';

const stateKey = (userId: string) => `match:state:${userId}`;
const queueKey = (skill: string) => `match:state:${skill}`;
const sessionKey = (sessionId: string) => `match:state:${sessionId}`;

export const matchingRepository = {
  getState: (userId: string) => redis.get(stateKey(userId)),
  setState: (userId: string, state: string) =>
    redis.set(stateKey(userId), state),

  popQueue: (skill: string) => redis.lpop(queueKey(skill)),
  pushQueue: (skill: string, userId: string) =>
    redis.rpush(queueKey(skill), userId),
  removeFromQueue: (userId: string, skill: string) =>
    redis.lrem(queueKey(skill), 0, userId),

  createSession: (session: MatchSession) =>
    redis.hset(sessionKey(session.sessionId), session as any),
};
