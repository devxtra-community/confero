import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Socket } from 'socket.io';
import { AuthenticatedUser } from '../types/tokenType';
import * as cookie from 'cookie';
import { presenceRepository } from '../repository/presenceRepository';

type SocketNext = (err?: Error) => void;

export const socketMiddleware = async (
  socket: Socket,
  next: SocketNext
): Promise<void> => {
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

    // ── Duplicate tab guard ──────────────────────────────────────────────────
    // If this userId already has one or more sockets registered in Redis,
    // reject the new connection immediately. The existing socket is untouched.
    //
    // Stale-lock edge case: if the previous tab hard-crashed without firing
    // a disconnect event, this key lives for up to 90s (PRESENCE_TTL) before
    // Redis expires it automatically. The user will be able to reconnect after
    // that window without any manual intervention.
    // ────────────────────────────────────────────────────────────────────────
    const activeSocketCount = await presenceRepository.getSocketCount(
      user.userId
    );

    if (activeSocketCount > 0) {
      return next(new Error('ALREADY_CONNECTED'));
    }

    socket.data.user = user;
    next();
  } catch (err) {
    console.error('SOCKET AUTH ERROR:', err);
    next(new Error('INVALID_TOKEN'));
  }
};