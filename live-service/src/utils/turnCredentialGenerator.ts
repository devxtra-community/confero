import crypto from 'crypto';
import { env } from '../config/env';

export function generateTurnCredentials(userId: string, callId: string) {
  const ttl = env.TURN_TTL;

  const timestamp = Math.floor(Date.now() / 1000) + ttl;

  const username = `${timestamp}:${userId}:${callId}`;

  const credential = crypto
    .createHmac('sha1', env.TURN_SECRET)
    .update(username)
    .digest('base64');

  return {
    username,
    credential,
  };
}
