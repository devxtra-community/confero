import { Router } from 'express';
import {
  login,
  logout,
  refresh,
  register,
  resendOtp,
  verifyOtp,
} from '../controllers/authController.js';
import { googleLogin } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/verifyotp', verifyOtp);
authRouter.post('/resend', resendOtp);
authRouter.post('/login', login);
authRouter.post('/google', googleLogin);

authRouter.post('/logout', logout);

authRouter.post('/refresh', refresh);

export default authRouter;
