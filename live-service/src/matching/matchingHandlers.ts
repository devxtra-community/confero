import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../socket/socketEvents';
import { matchingService } from '../service/matchService';

export const matchingHandlers = (socket: Socket, io: Server) => {
  socket.on(SOCKET_EVENTS.MATCH_START, async ({ skill }) => {
    const userId = socket.data.user.userId;

    const session = await matchingService.startMatch(userId, skill);
    if (!session) return;

    io.to(session.userA).emit(SOCKET_EVENTS.MATCH_FOUND, {
      sessionId: session.sessionId,
      peerId: session.userB,
    });

    io.to(session.userB).emit(SOCKET_EVENTS.MATCH_FOUND, {
      session: session.sessionId,
      peerId: session.userA,
    });
  });

  socket.on(SOCKET_EVENTS.MATCH_CANCEL, async ({ skill }) => {
    const userId = socket.data.user.userId;
    await matchingService.cancelMatching(userId, skill);
  });
};
