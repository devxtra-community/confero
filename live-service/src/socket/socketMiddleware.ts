import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Socket } from 'socket.io';
import { AuthenticatedUser } from '../types/tokenType';
import { logger } from '../config/logger';

type SocketNext = (err?: Error) => void;

export const socketMiddleware = (socket: Socket, next: SocketNext) => {
  try {
    logger.info(' auth middleware hit');

    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('auth required'));
    }
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      email: string;
    };
    const user: AuthenticatedUser = {
      userId: payload.sub,
      email: payload.email,
    };
    socket.data.user = user;
    next();
  } catch {
    next(new Error('INVALID_TOKEN'));
  }
};
