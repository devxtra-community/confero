import { Router } from 'express';
import { verifyAccessToken } from '../middlewares/verifyToken.js';
import { requireAdminRole, requireRole } from '../middlewares/requireRole.js';
import {
  adminDashboard,
  adminProfile,
  banUser,
  getBannedUsers,
  getReportedUsers,
  unbanUser,
} from '../controllers/adminController.js';

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

router.post('/ban', verifyAccessToken, requireAdminRole, banUser);

router.patch('/unban', verifyAccessToken, requireAdminRole, unbanUser);

router.get(
  '/reported-users',
  verifyAccessToken,
  requireAdminRole,
  getReportedUsers
);

router.get(
  '/banned-users',
  verifyAccessToken,
  requireAdminRole,
  getBannedUsers
);

export default router;
