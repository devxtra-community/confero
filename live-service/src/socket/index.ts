// this is where the socket id connection take place
import { Server } from 'socket.io';
import { socketMiddleware } from './socketMiddleware';
import { createServer } from 'http';
import { socketController } from './socketController';

export const initSocket = (httpserver: ReturnType<typeof createServer>) => {
  const io = new Server(httpserver, {
    cors: { origin: '*' },
  });

  io.use(socketMiddleware);

  io.on('connection', socket => {
    console.log('🔌 Socket connected:', socket.id);
    socketController(socket, io);
  });
  return io;
};
