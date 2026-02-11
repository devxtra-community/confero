import { UserReportModel } from '../models/userReport.js';

export const userReportRepository = {
  createReport: (data: any) => {
    return UserReportModel.create(data);
  },

  findExistingReport: (reportedUserId: string, reporterId: string) => {
    return UserReportModel.findOne({
      reportedUserId,
      reportedBy: reporterId,
    });
  },

  countReportsForUser: (reportedUserId: string) => {
    return UserReportModel.countDocuments({
      reportedUserId,
      status: 'pending',
    });
  },

  getPendingReports: () => {
    return UserReportModel.find({ status: 'pending' })
      .populate('reportedUserId')
      .populate('reportedBy');
  },

  updateStatus: (reportId: string, status: string) => {
    return UserReportModel.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );
  },

  deleteFromReport: (userId: string) => {
    return UserReportModel.deleteMany({ reportedUserId: userId });
  },

  getPendingReportsPaginated: async (page: number, limit: number) => {
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      UserReportModel.find({ status: 'pending' })
        .populate('reportedUserId')
        .populate('reportedBy')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      UserReportModel.countDocuments({
        status: 'pending',
      }),
    ]);

    return {
      reports,
      total,
    };
  },
};
