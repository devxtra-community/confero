import { Router } from 'express';
import {
  loginLimiter,
  otpLimiter,
  registerLimiter,
} from '../middlewares/rateLimit.js';
import { authProxy } from '../proxies/authProxy.js';

const authRouter = Router();

authRouter.post('/login', loginLimiter, authProxy);
authRouter.post('/register', registerLimiter, authProxy);
authRouter.post('/verifyOtp', otpLimiter, authProxy);
authRouter.post('/resend', otpLimiter, authProxy);
authRouter.post('/logout', authProxy);
authRouter.post('/refresh', authProxy);
authRouter.post('/google', authProxy);

authRouter.post('/forgot-password', authProxy);
authRouter.post('/reset-password', authProxy);

export default authRouter;
