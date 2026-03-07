import { Router } from 'express';
import { getPresenceStats } from '../controllers/adminPresenceController';

const adminPresenceRouter = Router();

adminPresenceRouter.get('/admin/presence', getPresenceStats);

export default adminPresenceRouter;
