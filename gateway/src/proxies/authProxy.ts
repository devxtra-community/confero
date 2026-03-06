import { createProxyMiddleware } from 'http-proxy-middleware';
import { ClientRequest, IncomingMessage } from 'node:http';
import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const authProxy = createProxyMiddleware({
  target: `${process.env.AUTH_SERVICE_URL}/auth`,
  changeOrigin: true,
  cookieDomainRewrite: isProduction ? { '*': '.conferoo.in' } : '',

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
