import otpModel from '../models/otpModel.js';

export interface CreateOtpInput {
  email: string;
  otp: number;
}
export const otpRepository = {
  create: (email: string, otp: number) => otpModel.create({ email, otp }),

  find: (email: string, otp: number) => otpModel.findOne({ email, otp }),

  delete: (email: string) => otpModel.deleteMany({ email }),
};
