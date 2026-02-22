export const rabbitConfig = {
  url: process.env.RABBITMQ_URL!,

  heartbeat: 60,

  reconnectDelay: 5000,

  prefetch: 10,
};