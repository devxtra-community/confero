import { sessionRepository } from '../repositories/sessionRepository.js';

export const sessionService = {
  getSessions: async (page: number, limit: number) => {
    return sessionRepository.getSessions({ page, limit });
  },
};
