import { AppError } from '../middlewares/errorHandller.js';
import { userBanRepository } from '../repositories/userBanRepository.js';
import { userReportRepository } from '../repositories/userReportRepository.js';
import { banService } from './banService.js';

const AUTO_BAN_THRESHOLD = 3;

export const reportService = {
  reportUser: async (
    reportedUserId: string,
    reporterId: string,
    reason: string
  ) => {
    if (reportedUserId === reporterId) {
      throw new AppError('cannot report yourself', 403);
    }
    const existingReport = await userReportRepository.findExistingReport(
      reportedUserId,
      reporterId
    );

    if (existingReport) {
      throw new AppError('Already reported', 403);
    }

    await userReportRepository.createReport({
      reportedUserId,
      reportedBy: reporterId,
      reason,
    });

    const reportCount =
      await userReportRepository.countReportsForUser(reportedUserId);

    const existingBan = await userBanRepository.findActiveBan(reportedUserId);

    const AUTO_BAN_DURATION_HOURS = 24;

    const expiresAt = new Date(
      Date.now() + AUTO_BAN_DURATION_HOURS * 60 * 60 * 1000
    );

    if (reportCount >= AUTO_BAN_THRESHOLD && !existingBan) {
      await banService.banUser(
        reportedUserId,
        'AUTO BAN threshold reached',
        undefined,
        expiresAt
      );
    }
  },

  getReportedUsers: async (page: number, limit: number) => {
    const { reports, total } =
      await userReportRepository.getPendingReportsPaginated(page, limit);

    return {
      reports,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
