import { Router } from 'express';
import { login, register, verifyOtp } from '../controllers/authController.js';
import { googleLogin } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/login', login);
authRouter.post('/google', googleLogin);

export default authRouter;
