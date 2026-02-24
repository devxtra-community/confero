import { env } from './env';

export const rabbitConfig = {
  url: env.RABBITMQ_URL!,

  heartbeat: 60,

  reconnectDelay: 5000,

  prefetch: 10,
};
