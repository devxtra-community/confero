import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../socket/socketEvents';
import { matchingService } from '../service/matchService';
import { callService } from '../service/callService';
import { matchingRepository } from '../repository/matchRepository';
import { presenceRepository } from '../repository/presenceRepository';
import redis from '../config/redis';

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

  socket.on(
    SOCKET_EVENTS.MATCH_DECLINE,
    async ({ sessionId, peerId }: { sessionId: string; peerId: string }) => {
      const userId = socket.data.user.userId;

      await Promise.all([
        // Clean this user
        matchingRepository.setState(userId, 'IDLE'),
        matchingRepository.removeUserFromAllQueues(userId),
        presenceRepository.clearSearching(userId),
        presenceRepository.clearInCall(userId),

        // Clean peer
        matchingRepository.setState(peerId, 'IDLE'),
        matchingRepository.removeUserFromAllQueues(peerId),
        presenceRepository.clearSearching(peerId),
        presenceRepository.clearInCall(peerId),

        // Delete session
        redis.del(`match:session:${sessionId}`),
        matchingRepository.setCooldown(userId, peerId),
      ]);

      // Notify peer
      io.to(peerId).emit(SOCKET_EVENTS.MATCH_DECLINED_BY_PEER);
    }
  );
  socket.on(
    SOCKET_EVENTS.MATCH_FIND_ANOTHER,
    async ({
      sessionId,
      peerId,
      skills,
    }: {
      sessionId: string;
      peerId: string;
      skills: string[];
    }) => {
      const userId = socket.data.user.userId;

      await Promise.all([
        matchingRepository.setState(userId, 'IDLE'),
        matchingRepository.removeUserFromAllQueues(userId),
        presenceRepository.clearSearching(userId),
        presenceRepository.clearInCall(userId),
        matchingRepository.setState(peerId, 'IDLE'),
        matchingRepository.removeUserFromAllQueues(peerId),
        presenceRepository.clearSearching(peerId),
        presenceRepository.clearInCall(peerId),
        redis.del(`match:session:${sessionId}`),
      ]);

      // Tell both frontends to show searching UI only — no match:start from frontend
      socket.emit(SOCKET_EVENTS.MATCH_FIND_ANOTHER_READY, { skills });
      io.to(peerId).emit(SOCKET_EVENTS.MATCH_PEER_FIND_ANOTHER);
    }
  );
};
