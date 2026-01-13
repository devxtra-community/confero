import { presenceRepository } from '../repository/presenceRepository';

export const PresenceService = {
  markOnline(userId: string, socketId: string) {
    return presenceRepository.setOnline(userId, socketId);
  },
  markOffline(userId: string) {
    return presenceRepository.remove(userId);
  },
};
