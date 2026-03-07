import { Request, Response } from 'express';
import { PresenceService } from '../service/presenceService';

export const getPresenceStats = async (_req: Request, res: Response) => {
  const [onlineCount, inCallCount] = await Promise.all([
    PresenceService.getOnlineCount(),
    PresenceService.getInCallCount(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      onlineCount,
      inCallCount,
    },
  });
};
