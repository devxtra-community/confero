import { Schema, model, Types, Document } from 'mongoose';

export interface AuthSessionDocument extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

const authSessionSchema = new Schema<AuthSessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const AuthSession = model<AuthSessionDocument>(
  'AuthSession',
  authSessionSchema
);
