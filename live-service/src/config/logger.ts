import winston from 'winston';
import { Logtail } from '@logtail/node';
import { LogtailTransport } from '@logtail/winston';

const transports: winston.transport[] = [new winston.transports.Console()];

if (process.env.BETTERSTACK_SOURCE_TOKEN) {
  const logtail = new Logtail(process.env.BETTERSTACK_SOURCE_TOKEN);
  transports.push(new LogtailTransport(logtail));
}

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'live-service' },
  transports,
});
