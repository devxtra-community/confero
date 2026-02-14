export const rabbitConfig = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  heartbeat: 60,
  reconnectDelay: 5000,
  prefetch: 10,
};
