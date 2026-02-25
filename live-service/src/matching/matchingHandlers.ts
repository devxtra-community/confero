import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../socket/socketEvents';
import { matchingService } from '../service/matchService';
import { callService } from '../service/callService';

export const matchingHandlers = (socket: Socket, io: Server) => {
  socket.on(SOCKET_EVENTS.MATCH_START, async ({ skills }) => {
    const userId = socket.data.user.userId;

    const result = await matchingService.startMatch(userId, skills);

    // Double-click guard — this socket already holds the searching lock
    if (result === 'ALREADY_SEARCHING') {
      socket.emit(SOCKET_EVENTS.ALREADY_SEARCHING);
      return;
    }

    // No peer found yet — user is queued, nothing to emit
    if (!result) return;

    // Match found — pre-register call and notify both users
    callService.create(result.sessionId, result.userA, result.userB);

    io.to(result.userA).emit(SOCKET_EVENTS.MATCH_FOUND, {
      sessionId: result.sessionId,
      peerId: result.userB,
      skill: result.skill,
    });

    io.to(result.userB).emit(SOCKET_EVENTS.MATCH_FOUND, {
      sessionId: result.sessionId,
      peerId: result.userA,
      skill: result.skill,
    });
  });

  socket.on(SOCKET_EVENTS.MATCH_CANCEL, async () => {
    const userId = socket.data.user.userId;
    await matchingService.cancelMatching(userId);
  });
};
