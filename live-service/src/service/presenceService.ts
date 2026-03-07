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
  },

  setSearching(userId: string, socketId: string) {
    return presenceRepository.setSearching(userId, socketId);
  },

  clearSearching(userId: string) {
    return presenceRepository.clearSearching(userId);
  },

  getSearchingSocketId(userId: string) {
    return presenceRepository.getSearchingSocketId(userId);
  },

  setInCall(userId: string, callId: string) {
    return presenceRepository.setInCall(userId, callId);
  },

  clearInCall(userId: string) {
    return presenceRepository.clearInCall(userId);
  },

  getInCallId(userId: string) {
    return presenceRepository.getInCallId(userId);
  },

  // ─── NEW ──────────────────────────────────────────────────────────────────
  getOnlineCount() {
    return presenceRepository.getOnlineCount();
  },

  getInCallCount() {
    return presenceRepository.getInCallCount();
  },
  // ─────────────────────────────────────────────────────────────────────────
};
