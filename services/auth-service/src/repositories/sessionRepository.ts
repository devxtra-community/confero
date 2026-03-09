import { SessionModel } from '../models/sessionModel.js';
import { redis } from '../config/redis.js';

export interface DailyMinutesPoint {
  date: Date;
  seconds: number;
  minutes: number;
  callCount: number;
}

const CACHE_TTL = 300;

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
    const CACHE_KEY = 'analytics:sessions:90d';

    // ── Cache read ────────────────────────────────────────────────────────
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis failure is non-fatal — fall through to DB query
    }

    // ── #5 FIX: bounded 90-day query — no full collection scan ────────────
    const since = new Date();
    since.setDate(since.getDate() - 90);
    since.setHours(0, 0, 0, 0);

    const sessions = await SessionModel.find(
      { startedAt: { $gte: since } },
      { startedAt: 1, endedAt: 1, endReason: 1 }
    )
      .lean()
      .exec();

    const result = sessions.map(s => ({
      startedAt: s.startedAt,
      endedAt: s.endedAt ?? null,
      durationSeconds: s.endedAt
        ? (s.endedAt.getTime() - s.startedAt.getTime()) / 1000
        : 0,
      endReason: s.endReason ?? null,
    }));

    // ── Cache write ───────────────────────────────────────────────────────
    try {
      await redis.set(CACHE_KEY, JSON.stringify(result), 'EX', CACHE_TTL);
    } catch {
      // Redis failure is non-fatal — analytics still returns correctly
    }

    return result;
  },

  // ── #3 FIX: single 30d query instead of two separate queries ─────────────
  // Service layer slices to 7 days when needed — one DB round trip total.
  // CHANGED: explicit return type so downstream code gets proper inference
  getDailyMinutes: async (): Promise<DailyMinutesPoint[]> => {
    const CACHE_KEY = 'analytics:daily:30d';

    // ── Cache read ────────────────────────────────────────────────────────
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis failure is non-fatal — fall through to DB query
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);
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
            $sum: { $subtract: ['$endedAt', '$startedAt'] },
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
          // Store seconds not minutes — avoids rounding loss for short calls
          seconds: '$totalSeconds',
          minutes: {
            $round: [{ $divide: ['$totalSeconds', 60000] }, 1],
          },
          callCount: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // ── Cache write ───────────────────────────────────────────────────────
    try {
      await redis.set(CACHE_KEY, JSON.stringify(result), 'EX', CACHE_TTL);
    } catch {
      // Redis failure is non-fatal
    }

    return result as {
      date: Date;
      seconds: number;
      minutes: number;
      callCount: number;
    }[];
  },
};
