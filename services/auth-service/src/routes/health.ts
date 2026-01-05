import { Router } from 'express';
import mongoose from 'mongoose';

const healthRouter = Router();

const dbStateMap: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

healthRouter.get('/health', (_req, res) => {
  const stateCode = mongoose.connection.readyState;

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      database: {
        stateCode,
        state: dbStateMap[stateCode] ?? 'unknown',
      },
    },
  });
});


export default healthRouter;
