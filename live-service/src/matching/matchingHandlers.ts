import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../socket/socketEvents';
import { matchingService } from '../service/matchService';

export const matchingHandlers = (socket: Socket, io: Server) => {
  socket.on(SOCKET_EVENTS.MATCH_START, async ({ skills }) => {
    const userId = socket.data.user.userId;
    const session = await matchingService.startMatch(userId, skills);
    if (!session) return;

    io.to(session.userA).emit(SOCKET_EVENTS.MATCH_FOUND, {
      sessionId: session.sessionId,
      peerId: session.userB,
      skill: session.skill,
    });

    io.to(session.userB).emit(SOCKET_EVENTS.MATCH_FOUND, {
      sessionId: session.sessionId,
      peerId: session.userA,
      skill: session.skill,
    });
  });

  socket.on(SOCKET_EVENTS.MATCH_CANCEL, async () => {
    const userId = socket.data.user.userId;
    await matchingService.cancelMatching(userId);
  });
};
