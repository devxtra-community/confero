import { Router } from 'express';
import { healthContoller } from '../config/health';


const healthRouter = Router();

healthRouter.get('/health', healthContoller);

export default healthRouter;
