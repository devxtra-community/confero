import { Router } from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  adminDashboard,
  adminProfile,
} from '../controllers/adminiController.js';

const router = Router();

router.get('/admin', verifyAccessToken, requireRole('admin'), adminDashboard);

router.get('/profile', verifyAccessToken, requireRole('admin'), adminProfile);

router.get('/verify-session', verifyAccessToken, (req: any, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
    },
  });
});
export default router;
