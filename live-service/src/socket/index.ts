// this is where the socket id connection take place
import { Server } from 'socket.io';
import { socketMiddleware } from './socketMiddleware';
import { createServer } from 'http';
import { callHandlers, socketController } from './socketController';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const initSocket = (httpserver: ReturnType<typeof createServer>) => {
  const io = new Server(httpserver, {
    cors: {
      origin: env.FRONTEND_URI,
      credentials: true,
    },
  });

  io.use(socketMiddleware);

  io.on('connection', socket => {
    logger.info(' Socket connected:', socket.id);
    socketController(socket, io);
    callHandlers(socket, io);
  });
  return io;
};
