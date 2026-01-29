import { Router } from 'express';
import { userProxy } from '../proxies/userProxy.js';

const userRouter = Router();

userRouter.get('/me', userProxy);
userRouter.post('/me/skills', userProxy);
userRouter.delete('/me/skills/:key', userProxy);
userRouter.patch('/update-profile', userProxy);

export default userRouter
