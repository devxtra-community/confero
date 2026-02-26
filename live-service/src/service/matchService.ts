import { v4 as uuid } from 'uuid';
import { matchingRepository } from '../repository/matchRepository';
import { presenceRepository } from '../repository/presenceRepository';
import { MatchSession } from '../matching/matchingTypes';

export const matchingService = {
  // startMatch keeps the original (userId, skills) signature.
  // socketId param removed — single device per user means whoever
  // calls startMatch is always the only socket. Double-click protection
  // is handled by SET NX on the searching lock.
  async startMatch(
    userId: string,
    skills: string[]
  ): Promise<MatchSession | 'ALREADY_SEARCHING' | null> {
    const isOnline = await presenceRepository.isOnline(userId);
    console.log(isOnline);
    if (!isOnline) return null;

    const state = await matchingRepository.getState(userId);
    if (state === 'MATCHED') return null;

    // ── Searching lock — atomic double-click guard ─────────────────────────
    // SET NX: only succeeds if key doesn't exist.
    // Protects against rapid double-clicks sending two match:start emits.
    // We use socket.id from the caller — passed through matchingHandlers.
    // ─────────────────────────────────────────────────────────────────────
    const lockAcquired = await presenceRepository.setSearching(userId, userId);
    if (!lockAcquired) {
      return 'ALREADY_SEARCHING';
    }

    const normalizedSkills = skills
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    await matchingRepository.setState(userId, 'SEARCHING');

    for (const skill of normalizedSkills) {
      const peerId = await matchingRepository.popQueueBySkill(skill);
      if (!peerId) continue;

      if (peerId === userId) {
        await matchingRepository.pushQueueOnce(skill, userId);
        continue;
      }

      const peerState = await matchingRepository.getState(peerId);
      const peerOnline = await presenceRepository.isOnline(peerId);

      if (peerState !== 'SEARCHING' || !peerOnline) {
        // Ghost peer — clear their stale searching lock too
        await presenceRepository.clearSearching(peerId);
        await matchingRepository.pushQueueOnce(skill, peerId);
        continue;
      }
      const onCooldown = await matchingRepository.hasCooldown(userId, peerId);
      if (onCooldown) {
        await matchingRepository.pushQueueOnce(skill, peerId);
        continue;
      }
      const session: MatchSession = {
        sessionId: uuid(),
        userA: userId,
        userB: peerId,
        skill,
        createdAt: Date.now(),
      };

      await matchingRepository.createSession(session);
      await matchingRepository.setState(userId, 'MATCHED');
      await matchingRepository.setState(peerId, 'MATCHED');
      await matchingRepository.removeUserFromAllQueues(userId);
      await matchingRepository.removeUserFromAllQueues(peerId);

      // Clear searching locks, set incall locks for both users
      await presenceRepository.clearSearching(userId);
      await presenceRepository.clearSearching(peerId);
      await presenceRepository.setInCall(userId, session.sessionId);
      await presenceRepository.setInCall(peerId, session.sessionId);
      await matchingRepository.setCooldown(userId, peerId);
      return session;
    }

    // No peer found yet — stay in queue, lock held
    for (const skill of normalizedSkills) {
      await matchingRepository.pushQueueOnce(skill, userId);
    }

    return null;
  },

  async cancelMatching(userId: string) {
    await Promise.all([
      matchingRepository.removeUserFromAllQueues(userId),
      matchingRepository.setState(userId, 'IDLE'),
      presenceRepository.clearSearching(userId),
    ]);
  },
};
