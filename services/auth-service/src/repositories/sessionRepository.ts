import { SessionModel } from '../models/sessionModel.js';

export const sessionRepository = {
  getSessions: async ({ page, limit }: { page: number; limit: number }) => {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      SessionModel.find()
        .sort({ startedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userA', 'fullName')
        .populate('userB', 'fullName')
        .lean(),
      SessionModel.countDocuments(),
    ]);
    return { data, total };
  },

  getAnalytics: async () => {
    const sessions = await SessionModel.find(
      {},
      { startedAt: 1, endedAt: 1, endReason: 1 }
    )
      .lean()
      .exec();

    return sessions.map(s => ({
      startedAt: s.startedAt,
      endedAt: s.endedAt ?? null,
      durationSeconds: s.endedAt
        ? (s.endedAt.getTime() - s.startedAt.getTime()) / 1000
        : 0,
      // Passes the raw string through — 'USER_ENDED' | 'ICE_FAILED' |
      // 'TIME_LIMIT' | null. Frontend maps these to display labels.
      endReason: s.endReason ?? null,
    }));
  },

  // ─── NEW ──────────────────────────────────────────────────────────────────
  // Aggregates total call minutes per calendar day.
  // Only counts sessions that actually ended (endedAt exists).
  // `days` param controls the lookback window (7 or 30).
  // Returns array sorted ascending by date so the chart renders left→right.
  getDailyMinutes: async (days: 7 | 30) => {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const result = await SessionModel.aggregate([
      {
        $match: {
          startedAt: { $gte: since },
          endedAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$startedAt' },
            month: { $month: '$startedAt' },
            day: { $dayOfMonth: '$startedAt' },
          },
          totalSeconds: {
            $sum: {
              $subtract: ['$endedAt', '$startedAt'],
            },
          },
          callCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day',
            },
          },
          minutes: {
            $round: [{ $divide: ['$totalSeconds', 60000] }, 1],
          },
          callCount: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return result as { date: Date; minutes: number; callCount: number }[];
  },
  // ─────────────────────────────────────────────────────────────────────────
};
