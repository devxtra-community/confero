import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

export const userProxy = createProxyMiddleware({
  target: `${process.env.AUTH_SERVICE_URL}/users`,
  changeOrigin: true,

  on: {
    proxyReq: (proxyReq, req: any) => {
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        proxyReq.setHeader('cookie', cookieHeader);
      }

      // ONLY forward JSON body when content-type is application/json
      const contentType = req.headers['content-type'] || '';

      if (
        contentType.includes('application/json') &&
        req.body &&
        ['POST', 'PUT', 'PATCH'].includes(proxyReq.method || '')
      ) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  },
});
