import { Router } from 'express';
import { updateSkills } from '../controllers/userController.js';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = Router();
console.log('reached');
router.patch('/me/skills', verifyAccessToken, updateSkills);

export default router;
