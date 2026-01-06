import { Router } from 'express';
import { register, verifyOtp } from '../controllers/authController.js';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/verify-otp', verifyOtp);

export default authRouter;
