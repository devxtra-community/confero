import { Router } from 'express';
import {
  addSkill,
  currentUser,
  removeSkill,
  updateProfile,
} from '../controllers/userController.js';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = Router();

router.post('/me/skills', verifyAccessToken, addSkill);
router.delete('/me/skills/:key', verifyAccessToken, removeSkill);
router.get('/me', verifyAccessToken, currentUser);
router.patch('/update-profile', verifyAccessToken, updateProfile);

export default router;
