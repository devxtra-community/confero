import { Router } from 'express';
import { userProxy } from '../proxies/userProxy.js';

const userRouter = Router();

userRouter.post('/me/avatar', userProxy);

export default userRouter;
