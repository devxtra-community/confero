import morgan from 'morgan';
import { logger } from './logger.js';

export const morganMiddleware = morgan((tokens, req, res) => {
  const responseTime = Number(tokens['response-time'](req, res));
  const status = Number(tokens.status(req, res));

  const logData = {
    type: 'http',
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status,
    responseTime,
    contentLength: tokens.res(req, res, 'content-length') || 0,
    slow: responseTime > 1000,       
    error: status >= 500,            
  };

  if (status >= 500) {
    logger.error(logData);           
  } else if (responseTime > 1000) {
    logger.warn(logData);            
  } else {
    logger.info(logData);            
  }

  return null;
});