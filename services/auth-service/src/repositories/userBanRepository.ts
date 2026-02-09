import mongoose from 'mongoose';
import { UserBanModel } from '../models/userBan.js';

export const userBanRepository = {
  createBan: (data: any) => {
    return UserBanModel.create(data);
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

  getActiveBans: () => {
    return UserBanModel.find({ active: true }).populate('userId');
  },
};
