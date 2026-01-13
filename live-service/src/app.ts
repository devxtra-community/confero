import express from 'express';
import http from 'http';
import { initSocket } from './socket';

export const createApp = () => {
  const app = express();
  const server = http.createServer(app);
  initSocket(server);
  return server;
};
