import { SOCKET_EVENTS } from './socketEvents';
import { Server, Socket } from 'socket.io';
import { PresenceService } from '../service/presenceService';
import { AuthenticatedUser } from '../types/tokenType';
import { registerCallHandlers } from './callHandlers';
import { callService } from '../service/callService';
import { logger } from '../config/logger';

export const callHandlers = (socket: Socket, io: Server) => {
  const userId = socket.data.user.userId;

  socket.join(userId);

  registerCallHandlers(socket, io);

  socket.on('disconnect', () => {
    const userId = socket.data.user.userId;

    for (const [callId, call] of callService.getAll()) {
      if (call.from === userId || call.to === userId) {
        io.to(call.from)
          .to(call.to)
          .emit(SOCKET_EVENTS.CALL_END, { callId, reason: 'DISCONNECTED' });

        callService.update(callId, 'ENDED');
        callService.remove(callId);
      }
    }
  });
};

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds

export const socketController = (socket: Socket, io: Server) => {
  logger.info('socket controller running');

  const user = socket.data.user as AuthenticatedUser;

  // 1. Mark online when connected
  PresenceService.markOnline(user.userId, socket.id);

  socket.emit(SOCKET_EVENTS.AUTH_SUCCESS, {
    userId: socket.data.user.userId,
    email: socket.data.user.email,
  });

  // 2. Start heartbeat to refresh TTL
  const heartbeat = setInterval(() => {
    PresenceService.refresh(user.userId);
  }, HEARTBEAT_INTERVAL);

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    clearInterval(heartbeat);

    void (async () => {
      const fullyOffline = await PresenceService.markOffline(
        user.userId,
        socket.id
      );

      if (fullyOffline) {
        io.emit(SOCKET_EVENTS.USER_OFFLINE, { userId: user.email });
      }
    })();
  });
};
