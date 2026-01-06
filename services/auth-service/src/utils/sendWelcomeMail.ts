import { mailer } from './mailer.js';
import { env } from '../config/env.js';

export const sendWelcomeMail = async (email: string) => {
  await mailer.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: `Welcome ${email}`,
    text: 'Successfully registered to Confero',
  });
};
