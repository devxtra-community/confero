import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../socket/socketEvents';
import { matchingService } from '../service/matchService';
import { callService } from '../service/callService'; // ← ADD THIS IMPORT

export const matchingHandlers = (socket: Socket, io: Server) => {
  socket.on(SOCKET_EVENTS.MATCH_START, async ({ skills }) => {
    const userId = socket.data.user.userId;
    const session = await matchingService.startMatch(userId, skills);
    if (!session) return;

    // ── NEW: Pre-register the call NOW while we know both userIds ──
    // This means peer:ready from either side will always find the call record
    callService.create(session.sessionId, session.userA, session.userB);
    // ─────────────────────────────────────────────────────────────

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
