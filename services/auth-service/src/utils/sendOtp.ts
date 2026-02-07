import { mailer } from './mailer.js';
import { env } from '../config/env.js';

export const sendOtpMail = async (email: string, otp: string) => {
  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: 'Verify your email',
    text: `Your OTP is ${otp}. It expires in 3 minutes.`,
  });
};

export const sendResetPasswordEmail = async (email: string, link: string) => {
  await mailer.sendMail({
    to: email,
    subject: 'Reset Password',
    html: `
         <h3>Reset your password</h3>
         <p>Click below link:</p>
         <a href="${link}">${link}</a>
      `,
  });
};
