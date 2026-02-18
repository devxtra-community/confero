import { v4 as uuid } from 'uuid';
import { matchingRepository } from '../repository/matchRepository';
import { presenceRepository } from '../repository/presenceRepository';
import { MatchSession } from '../matching/matchingTypes';

export const matchingService = {
  async startMatch(userId: string, skills: string[]) {
    const isOnline = await presenceRepository.isOnline(userId);
    console.log(isOnline);
    if (!isOnline) return null;

    const state = await matchingRepository.getState(userId);
    if (state === 'MATCHED') return null;

    const normalizedSkills = skills
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    await matchingRepository.setState(userId, 'SEARCHING');
    for (const skill of normalizedSkills) {
      const peerId = await matchingRepository.popQueueBySkill(skill);
      console.log('peer', peerId);
      if (!peerId) continue;

      if (peerId === userId) {
        await matchingRepository.pushQueueOnce(skill, userId);
        continue;
      }

      const peerState = await matchingRepository.getState(peerId);
      const peerOnline = await presenceRepository.isOnline(peerId);

      if (peerState !== 'SEARCHING' || !peerOnline) {
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

      return session;
    }

    for (const skill of normalizedSkills) {
      await matchingRepository.pushQueueOnce(skill, userId);
    }

    return null;
  },

  async cancelMatching(userId: string) {
    const state = await matchingRepository.getState(userId);

    if (state !== 'SEARCHING') {
      await matchingRepository.setState(userId, 'IDLE');
      return;
    }

    await matchingRepository.removeUserFromAllQueues(userId);

    await matchingRepository.setState(userId, 'IDLE');
  },
};
