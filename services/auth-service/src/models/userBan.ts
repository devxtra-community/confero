import mongoose, { Schema, Document } from 'mongoose';

export interface IUserBan extends Document {
  userId: mongoose.Types.ObjectId;
  bannedBy?: mongoose.Types.ObjectId;
  banType: 'admin' | 'auto';
  reason: string;
  bannedAt: Date;
  expiresAt?: Date;
  active: boolean;
}

const userBanSchema = new Schema<IUserBan>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },

  bannedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },

  banType: {
    type: String,
    enum: ['admin', 'auto'],
    default: 'admin',
  },

  reason: String,

  bannedAt: { type: Date, default: Date.now },

  expiresAt: Date,

  active: { type: Boolean, default: true },
});

export const UserBanModel = mongoose.model('BannedUsers', userBanSchema);
