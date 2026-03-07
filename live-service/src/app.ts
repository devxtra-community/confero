import express from 'express';
import http from 'http';
import cors from 'cors';
import { initSocket } from './socket';
import healthRouter from './routes/healthRoute';
import adminPresenceRouter from './routes/adminPresenceRoute';
import { env } from './config/env';

export const createApp = () => {
  const app = express();
  app.use(
    cors({
      origin: env.FRONTEND_URI,
      credentials: true,
    })
  );

  app.use(healthRouter);
  app.use(adminPresenceRouter);
  const server = http.createServer(app);
  initSocket(server);
  return server;
};
