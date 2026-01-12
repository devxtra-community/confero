import { SOCKET_EVENTS } from './socketEvents';
import { PresenceService } from '../service/presenceService';
import { Server, Socket } from 'socket.io';
import { AuthenticatedUser } from '../types/tokenType';

export const socketController = (socket: Socket, io: Server) => {
  console.log('🎮 socket controller running');
  const user = socket.data.user as AuthenticatedUser;

  PresenceService.markOnline(user.userId, socket.id);

  socket.emit(SOCKET_EVENTS.AUTH_SUCCESS);

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    void (async () => {
      await PresenceService.markOffline(user.userId);
      io.emit(SOCKET_EVENTS.USER_OFFLINE, { userId: user.email });
    })();
  });
};
