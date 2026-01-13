import express from 'express';
import http from 'http';
import { initSocket } from './socket';
import healthRouter from './routes/healthRoute';

export const createApp = () => {
  const app = express();
  app.use(healthRouter);
  const server = http.createServer(app);
  initSocket(server);
  return server;
};
