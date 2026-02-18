import { Router } from 'express';
import { userProxy } from '../proxies/userProxy.js';

const userRouter = Router();

userRouter.get('/me', userProxy);
userRouter.patch('/update-profile', userProxy);

userRouter.post('/me/skills', userProxy);
userRouter.delete('/me/skills/:key', userProxy);

userRouter.get('/peer/:userId', userProxy);
userRouter.post('/report-user', userProxy);

userRouter.get('/verify-session', userProxy);

userRouter.post('/me/avatar/upload-url', userProxy);
userRouter.post('/me/avatar/complete', userProxy);
userRouter.delete('/me/avatar', userProxy);

userRouter.post('/me/banner/upload-url', userProxy);
userRouter.post('/me/banner/complete', userProxy);

export default userRouter;
