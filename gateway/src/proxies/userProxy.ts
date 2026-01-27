import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';

dotenv.config();

export const userProxy = createProxyMiddleware({
  target: `${process.env.AUTH_SERVICE_URL}/users`,
  changeOrigin: true,
  selfHandleResponse: false,

  on: {
    proxyReq: (proxyReq, req: any) => {
      const authHeader = req.headers['authorization'];
      console.log(authHeader);
      if (authHeader) {
        proxyReq.setHeader('authorization', authHeader);
      }

      if (
        req.body &&
        ['POST', 'PUT', 'PATCH'].includes(proxyReq.method || '')
      ) {
        const bodyData = JSON.stringify(req.body);
        console.log(bodyData);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    },
  },
});
