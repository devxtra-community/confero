import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Socket } from 'socket.io';
import { AuthenticatedUser } from '../types/tokenType';
import * as cookie from 'cookie';

type SocketNext = (err?: Error) => void;

export const socketMiddleware = (socket: Socket, next: SocketNext) => {
  try {
    const rawCookie = socket.handshake.headers.cookie;

    if (!rawCookie) {
      return next(new Error('NO_COOKIE'));
    }

    const cookies = cookie.parse(rawCookie);

    const token = cookies.accessToken;
    if (!token) {
      return next(new Error('NO_ACCESS_TOKEN'));
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
  } catch (err) {
    console.error('SOCKET AUTH ERROR:', err);
    next(new Error('INVALID_TOKEN'));
  }
};
