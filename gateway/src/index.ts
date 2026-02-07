import http from 'http';
import app from './app.js';
import type { Socket as NetSocket } from 'net';
import { liveProxy } from './proxies/liveProxy.js';

const server = http.createServer(app);

server.on('upgrade', (req, socket, head) => {
  if (req.url?.startsWith('/live/socket.io')) {
    liveProxy.upgrade(req, socket as unknown as NetSocket, head);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on ${process.env.GATEWAY_URL}`);
});
