import { createProxyMiddleware } from 'http-proxy-middleware';
import type { ClientRequest, IncomingMessage } from 'http';

export const liveProxy = createProxyMiddleware({
  target: process.env.LIVE_SERVICE_URL,
  changeOrigin: true,
  ws: true,
  pathRewrite: {
    '^/live': '',
  },

  on: {
    proxyReq: (proxyReq: ClientRequest, req: IncomingMessage) => {
      const cookieHeader = req.headers.cookie;
      if (typeof cookieHeader === 'string') {
        proxyReq.setHeader('cookie', cookieHeader);
      }
    },

    proxyReqWs: (proxyReq: ClientRequest, req: IncomingMessage) => {
      const cookieHeader = req.headers.cookie;

      if (typeof cookieHeader === 'string') {
        proxyReq.setHeader('cookie', cookieHeader);
      }
    },
  },
});
