import { SOCKET_EVENTS } from './socketEvents';
import { PresenceService } from '../service/presenceService';
import { Server, Socket } from 'socket.io';
import { AuthenticatedUser } from '../types/tokenType';
import { logger } from '../config/logger';

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds

export const socketController = (socket: Socket, io: Server) => {
  logger.info('socket controller running');

  const user = socket.data.user as AuthenticatedUser;

  // 1. Mark online when connected
  PresenceService.markOnline(user.userId, socket.id);

  socket.emit(SOCKET_EVENTS.AUTH_SUCCESS);

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
