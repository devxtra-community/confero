import { createProxyMiddleware } from 'http-proxy-middleware';
import { ClientRequest, IncomingMessage } from 'node:http';
import dotenv from 'dotenv';
dotenv.config();

export const authProxy = createProxyMiddleware({
  target: `${process.env.AUTH_SERVICE_URL}/auth`,
  changeOrigin: true,
  cookieDomainRewrite: '', 

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
});
