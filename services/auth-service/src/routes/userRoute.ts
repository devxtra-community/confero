import { Router } from 'express';

import {
  addSkill,
  currentUser,
  getPublicProfile,
  removeSkill,
  updateProfile,
  deleteAvatar,

  getAvatarUploadUrl,
  completeAvatarUpload,
  getBannerUploadUrl,
  completeBannerUpload,
} from '../controllers/userController.js';

import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = Router();

/* ---------------- basic profile ---------------- */

router.post('/me/skills', verifyAccessToken, addSkill);
router.delete('/me/skills/:key', verifyAccessToken, removeSkill);
router.get('/me', verifyAccessToken, currentUser);
router.patch('/update-profile', verifyAccessToken, updateProfile);

router.get('/peer/:userId', verifyAccessToken, getPublicProfile);

/* ---------------- avatar (signed upload) ---------------- */

router.post(
  '/me/avatar/upload-url',
  verifyAccessToken,
  getAvatarUploadUrl
);

router.post(
  '/me/avatar/complete',
  verifyAccessToken,
  completeAvatarUpload
);

router.delete('/me/avatar', verifyAccessToken, deleteAvatar);

/* ---------------- banner (signed upload) ---------------- */

router.post(
  '/me/banner/upload-url',
  verifyAccessToken,
  getBannerUploadUrl
);

router.post(
  '/me/banner/complete',
  verifyAccessToken,
  completeBannerUpload
);

/* ---------------- session check ---------------- */

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
