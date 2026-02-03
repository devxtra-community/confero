import { Router } from 'express';
import { userProxy } from '../proxies/userProxy.js';

const userRouter = Router();

userRouter.post('/me/avatar', userProxy);
userRouter.get('/me', userProxy);
userRouter.post('/me/skills', userProxy);
userRouter.delete('/me/skills/:key', userProxy);
userRouter.patch('/update-profile', userProxy);

userRouter.get('/peer/:userId', userProxy);

export default userRouter;
