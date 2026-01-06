import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import type { ClientRequest, IncomingMessage } from 'http';

const router = Router();

router.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:4040',
    changeOrigin: true,

    on: {
      proxyReq: (proxyReq: ClientRequest, req: IncomingMessage) => {
        const body = (req as any).body;

        if (body) {
          const bodyData = JSON.stringify(body);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
          proxyReq.write(bodyData);
        }
      },
    },
  })
);

export default router;
