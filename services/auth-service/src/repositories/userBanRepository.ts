import mongoose from 'mongoose';
import { UserBanModel } from '../models/userBan.js';
import '../models/userModel.js';

interface getBannedUser {
  page: number;
  limit: number;
}
export const userBanRepository = {
  createBan: (data: any) => {
    return UserBanModel.create({
      ...data,
      expiresAt: data.expiresAt || null,
    });
  },

  findActiveBan: (userId: string | mongoose.Types.ObjectId) => {
    return UserBanModel.findOne({
      userId,
      active: true,
    });
  },

  deactivate: (userId: string) => {
    return UserBanModel.findOneAndUpdate(
      {
        userId: userId,
        active: true,
      },
      {
        active: false,
      }
    );
  },

  getActiveBans: async ({ page, limit }: getBannedUser) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      UserBanModel.find()
        .populate('userId', 'fullName email')
        .sort({ bannedAt: -1 })
        .skip(skip)
        .limit(limit),

      UserBanModel.countDocuments({ active: true }),
    ]);
    return { data, total };
  },

  getAllBans: () => {
    return UserBanModel.find({ active: true }).populate('userId');
  },

  autoDeactivateExpired: async () => {
    return UserBanModel.updateMany(
      {
        active: true,
        expiresAt: { $lte: new Date() },
      },
      {
        $set: { active: false },
      }
    );
  },
};
