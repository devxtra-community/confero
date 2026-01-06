import { mailer } from './mailer.js';
import { env } from '../config/env.js';

export const sendOtpMail = async (email: string, otp: number) => {
  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'Verify your email',
    text: `Your OTP is ${otp}. It expires in 3 minutes.`,
  });
};
