import { Request, Response } from 'express';
import { healthService } from '../service/healthService';

export const healthContoller = async (_req: Request, res: Response) => {
  try {
    const health = await healthService.check();
    res.status(200).json(health);
  } catch {
    res.status(500).json({
      status: 'Error',
      redis: 'Down',
    });
  }
};
