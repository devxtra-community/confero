import { Router } from 'express';
import {
  loginLimiter,
  otpLimiter,
  registerLimiter,
} from '../middlewares/rateLimit.js';
import { authProxy } from '../proxies/authProxy.js';
import { userProxy } from '../proxies/userProxy.js';

const authRouter = Router();

authRouter.post('/login', loginLimiter, authProxy);
authRouter.post('/register', registerLimiter, authProxy);
authRouter.post('/verifyOtp', otpLimiter, authProxy);
authRouter.post('/resend', otpLimiter, authProxy);
authRouter.post('/logout', authProxy);
authRouter.post('/refresh', authProxy);
authRouter.post('/google', authProxy);

authRouter.patch('/me/skills', userProxy);
authRouter.get('/me', userProxy);
authRouter.patch('/update-profile', userProxy);

export default authRouter;
