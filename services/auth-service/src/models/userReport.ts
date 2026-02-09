import mongoose, { Schema, Document } from 'mongoose';

export interface IUserReport extends Document {
  reportedUserId: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

const userReportSchema = new Schema<IUserReport>(
  {
    reportedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String,
    description: String,
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

userReportSchema.index({ reportedUserId: 1, reportedBy: 1 }, { unique: true });

export const UserReportModel = mongoose.model('UserReport', userReportSchema);
