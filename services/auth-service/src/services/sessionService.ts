import {
  sessionRepository,
  DailyMinutesPoint,
} from '../repositories/sessionRepository.js';

export const sessionService = {
  getSessions: async (page: number, limit: number) => {
    return sessionRepository.getSessions({ page, limit });
  },

  getAnalytics: async () => {
    return sessionRepository.getAnalytics();
  },

  getDailyMinutes: async () => {
    const all30: DailyMinutesPoint[] =
      await sessionRepository.getDailyMinutes();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7 = all30.filter(
      (p: DailyMinutesPoint) => new Date(p.date) >= sevenDaysAgo
    );

    return { last7, last30: all30 };
  },
};
