import { AuthSession } from '../models/auth-session.model.js';
import { Types } from 'mongoose';

export const authSessionRepository = {
  create: async (data: {
    userId: Types.ObjectId;
    refreshTokenHash: string;
    expiresAt: Date;
  }) => {
    return AuthSession.create(data);
  },

  findValidByTokenHash: async (refreshTokenHash: string) => {
    return AuthSession.findOne({
      refreshTokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });
  },

  revokeAllForUser: async (userId: Types.ObjectId) => {
    return AuthSession.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    );
  },

  revoke: async (refreshTokenHash: string) => {
    return AuthSession.updateOne(
      { refreshTokenHash },
      { revokedAt: new Date() }
    );
  },
  deleteByRefreshTokenHash: async (refreshTokenHash: string) => {
    return AuthSession.deleteOne({ refreshTokenHash });
  },
};
