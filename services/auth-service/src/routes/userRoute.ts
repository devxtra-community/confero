import { Router } from 'express';
import { upload } from '../middlewares/upload.js';
import {
  currentUser,
  updateProfile,
  updateSkills,
  uploadAvatar,
} from '../controllers/userController.js';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = Router();

router.patch('/me/skills', verifyAccessToken, updateSkills);
router.get('/me', verifyAccessToken, currentUser);
router.patch('/update-profile', verifyAccessToken, updateProfile);
router.post(
  '/me/avatar',
  verifyAccessToken,
  upload.single('avatar'),
  uploadAvatar
);
export default router;
