import mongoose, { Schema } from 'mongoose';

interface Otp {
  email: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<Otp>({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 180,
  },
});

const otpModel = mongoose.model<Otp>('otp', otpSchema);

export default otpModel;
