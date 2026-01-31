import { v4 as uuid } from 'uuid';
import { MatchSession } from '../matching/matchingTypes';
import { matchingRepository } from '../repository/matchRepository';
import { presenceRepository } from '../repository/presenceRepository';

export const matchingService = {
  async startMatch(userId: string, skill: string) {
    const isOnline = await presenceRepository.isOnline(userId);
    if (!isOnline) return null;

    const state = await matchingRepository.getState(userId);
    if (state === 'SEARCHING') return null;

    console.log('ur amazing broooo', isOnline);
    await matchingRepository.setState(userId, 'SEARCHING');
    const peerId = await matchingRepository.popQueue(skill);
    console.log(peerId);
    if (peerId && peerId !== userId) {
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

      return session;
    }

    await matchingRepository.pushQueue(skill, userId);
    return null;
  },

  async cancelMatching(userId: string, skill: string) {
    await matchingRepository.removeFromQueue(userId, skill);
    await matchingRepository.setState(userId, 'IDLE');
  },
};
