import { SessionModel } from '../models/sessionModel.js';

interface PaginationOptions {
  page: number;
  limit: number;
}

export const sessionRepository = {
  getSessions: async ({ page, limit }: PaginationOptions) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      SessionModel.find()
        .populate('userA', 'fullName email')
        .populate('userB', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      SessionModel.countDocuments(),
    ]);

    return { data, total };
  },
};
