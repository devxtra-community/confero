import { SOCKET_EVENTS } from './socketEvents';
import { Server, Socket } from 'socket.io';
import { PresenceService } from '../service/presenceService';
import { AuthenticatedUser } from '../types/tokenType';
import { registerCallHandlers } from './callHandlers';
import { callService } from '../service/callService';
import { logger } from '../config/logger';
import { matchingRepository } from '../repository/matchRepository';

export const callHandlers = (socket: Socket, io: Server) => {
  const userId = socket.data.user.userId;

  socket.join(userId);

  registerCallHandlers(socket, io);

  socket.on('disconnect', () => {
    for (const [callId, call] of callService.getAll()) {
      if (call.from === userId || call.to === userId) {
        io.to(call.from).to(call.to).emit(SOCKET_EVENTS.CALL_END, {
          callId,
          reason: 'DISCONNECTED',
        });

        callService.update(callId, 'ENDED');
        callService.remove(callId);
      }
    }
  });
};

const HEARTBEAT_INTERVAL = 30_000;

export const socketController = async (socket: Socket) => {
  logger.info('socket controller running');

  const user = socket.data.user as AuthenticatedUser;

  PresenceService.markOnline(user.userId, socket.id);

  await matchingRepository.setState(user.userId, 'IDLE');

  socket.emit(SOCKET_EVENTS.AUTH_SUCCESS, {
    userId: user.userId,
    email: user.email,
  });

  const heartbeat = setInterval(() => {
    PresenceService.refresh(user.userId);
  }, HEARTBEAT_INTERVAL);

  socket.on('disconnect', async () => {
    clearInterval(heartbeat);

    const fullyOffline = await PresenceService.markOffline(
      user.userId,
      socket.id
    );

    if (fullyOffline) {
      logger.info(`User fully offline: ${user.userId}`);
    }
  });
};
