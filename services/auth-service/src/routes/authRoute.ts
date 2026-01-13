import { Router } from 'express';
import {
  login,
  logout,
  refresh,
  register,
  verifyOtp,
} from '../controllers/authController.js';
import { googleLogin } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/verifyotp', verifyOtp);
authRouter.post('/login', login);
authRouter.post('/google', googleLogin);

authRouter.post('/logout', logout);
// access Token refreshEnd Point
authRouter.post('/refresh', refresh);

export default authRouter;
