import { Router } from 'express';
import { upload } from '../middlewares/upload.js';
import {
  addSkill,
  currentUser,
  getPublicProfile,
  removeSkill,
  updateProfile,
  uploadAvatar,
} from '../controllers/userController.js';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = Router();

router.post('/me/skills', verifyAccessToken, addSkill);
router.delete('/me/skills/:key', verifyAccessToken, removeSkill);
router.get('/me', verifyAccessToken, currentUser);
router.patch('/update-profile', verifyAccessToken, updateProfile);

router.get('/peer/:userId', verifyAccessToken, getPublicProfile);
router.post(
  '/me/avatar',
  verifyAccessToken,
  upload.single('avatar'),
  uploadAvatar
);
export default router;
