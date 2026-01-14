import { SOCKET_EVENTS } from './socketEvents';
import { Server, Socket } from 'socket.io';
import { PresenceService } from '../service/presenceService';
import { AuthenticatedUser } from '../types/tokenType';
import { registerCallHandlers } from './callHandlers';
import { callService } from '../service/callService';

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

export const socketController = (socket: Socket, io: Server) => {
  const user = socket.data.user as AuthenticatedUser;

  PresenceService.markOnline(user.userId, socket.id);

  socket.emit(SOCKET_EVENTS.AUTH_SUCCESS, {
    userId: socket.data.user.userId,
    email: socket.data.user.email,
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    void (async () => {
      await PresenceService.markOffline(user.userId);
      io.emit(SOCKET_EVENTS.USER_OFFLINE, { userId: user.email });
    })();
  });
};
