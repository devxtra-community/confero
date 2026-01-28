import { Router } from 'express';
import { updateSkills } from '../controllers/userController.js';
import { verifyAccessToken } from '../middlewares/verifyToken.js';

const router = Router();

router.patch('/me/skills', verifyAccessToken, updateSkills);

export default router;
