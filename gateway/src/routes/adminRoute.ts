import { Router } from 'express';
import { adminProxy } from '../proxies/adminProxy.js';

const adminRouter = Router();

adminRouter.post('/ban', adminProxy);
adminRouter.patch('/unban', adminProxy);

export default adminRouter;
