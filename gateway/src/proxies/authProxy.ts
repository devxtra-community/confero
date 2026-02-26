import { createProxyMiddleware } from 'http-proxy-middleware';
import { ClientRequest, IncomingMessage, ServerResponse } from 'node:http';
import dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

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

    proxyRes: (
      proxyRes: IncomingMessage,
      _req: IncomingMessage,
      res: ServerResponse
    ) => {
      const cookies = proxyRes.headers['set-cookie'];

      if (cookies) {
        const updatedCookies = cookies.map((cookie: string) => {
          if (isProduction) {
            if (!cookie.includes('SameSite')) {
              cookie += '; SameSite=None';
            }
            if (!cookie.includes('Secure')) {
              cookie += '; Secure';
            }
          }
          return cookie;
        });

        res.setHeader('Set-Cookie', updatedCookies);
      }
    },
  },
});
