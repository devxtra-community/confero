import { sessionRepository } from '../repositories/sessionRepository.js';

export const sessionService = {
  getSessions: async (page: number, limit: number) => {
    return sessionRepository.getSessions({ page, limit });
  },

  getAnalytics: async () => {
    return sessionRepository.getAnalytics();
  },

  getDailyMinutes: async (days: 7 | 30) => {
    return sessionRepository.getDailyMinutes(days);
  },
};
