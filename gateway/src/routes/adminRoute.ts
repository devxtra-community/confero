import { Router } from 'express';
import { adminProxy } from '../proxies/adminProxy.js';

const adminRouter = Router();

adminRouter.post('/ban', adminProxy);
adminRouter.patch('/unban', adminProxy);
adminRouter.get('/reported-users', adminProxy);

export default adminRouter;
