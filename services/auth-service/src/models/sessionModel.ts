import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  sessionId: string;
  userA: string;
  userB: string;
  startedAt: Date;
  endedAt?: Date;
  endReason?: string;
}

const sessionSchema = new Schema<ISession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userA: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    userB: {
      type: String,
      ref: 'User',
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    // ─── CHANGED ────────────────────────────────────────────────────────────
    // Fixed enum to match what callHandlers.ts actually publishes via RabbitMQ.
    // Old: 'DISCONNECTED' | 'TIMEOUT' | 'ICE_FAILED' | 'ENDED'  ← never used
    // New: 'USER_ENDED' | 'ICE_FAILED' | 'TIME_LIMIT'           ← reality
    endReason: {
      type: String,
      enum: ['USER_ENDED', 'ICE_FAILED', 'TIME_LIMIT'],
      default: null,
    },
    // ────────────────────────────────────────────────────────────────────────
  },
  {
    timestamps: true,
  }
);

sessionSchema.virtual('durationSeconds').get(function () {
  if (!this.endedAt) return null;
  return (this.endedAt.getTime() - this.startedAt.getTime()) / 1000;
});

export const SessionModel = mongoose.model<ISession>('Session', sessionSchema);
