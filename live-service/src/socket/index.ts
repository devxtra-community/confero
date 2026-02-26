// this is where the socket id connection take place
import { Server } from 'socket.io';
import { socketMiddleware } from './socketMiddleware';
import { createServer } from 'http';
import {
  callHandlers,
  socketController,
} from '../controllers/socketController';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { matchingHandlers } from '../matching/matchingHandlers';

export const initSocket = (httpserver: ReturnType<typeof createServer>) => {
  const io = new Server(httpserver, {
    cors: {
      origin: env.FRONTEND_URI,
      credentials: true,
    },
  });

  io.use(socketMiddleware);

  io.on('connection', socket => {
    const userId = socket.data.user?.userId;

    if (!userId) {
      logger.error('Socket connected without userId', socket.id);
      socket.disconnect();
      return;
    }

    // socket.join(userId) is called inside callHandlers — removed duplicate here
    socketController(socket);
    callHandlers(socket, io);
    matchingHandlers(socket, io);
  });

  return io;
};
