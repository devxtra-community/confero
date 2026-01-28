import { Router } from 'express';
import {
  currentUser,
  updateProfile,
  updateSkills,
} from '../controllers/userController.js';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = Router();

router.patch('/me/skills', verifyAccessToken, updateSkills);
router.get('/me', verifyAccessToken, currentUser);
router.patch('/update-profile', verifyAccessToken, updateProfile);

export default router;
