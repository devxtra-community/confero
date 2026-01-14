import { presenceRepository } from '../repository/presenceRepository';

export const PresenceService = {
  markOnline(userId: string, socketId: string) {
    return presenceRepository.addSocket(userId, socketId);
  },

  refresh(userId: string) {
    return presenceRepository.refresh(userId);
  },

  markOffline(userId: string, socketId: string) {
    return presenceRepository.removeSocket(userId, socketId);
  }
};
