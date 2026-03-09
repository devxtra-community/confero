import express from 'express';
import http from 'http';
import { initSocket } from './socket';
import healthRouter from './routes/healthRoute';
import adminPresenceRouter from './routes/adminPresenceRoute';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(healthRouter);
  app.use(adminPresenceRouter);
  const server = http.createServer(app);
  initSocket(server);
  return server;
};
