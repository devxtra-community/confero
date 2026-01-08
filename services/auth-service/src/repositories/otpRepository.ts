import otpModel from '../models/otpModel.js';

export interface CreateOtpInput {
  email: string;
  otp: string;
}
export const otpRepository = {
  create: (email: string, otp: string) => otpModel.create({ email, otp }),

  find: (email: string, otp: string) => otpModel.findOne({ email, otp }),

  delete: (email: string) => otpModel.deleteMany({ email }),
};
