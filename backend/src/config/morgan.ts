import morgan from 'morgan';
import { logger } from './logger.js';

export const morganMiddleware = morgan((tokens, req, res) => {
  logger.info({
    type: 'http',
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    responseTime: Number(tokens['response-time'](req, res)),
  });
  return null;
});
