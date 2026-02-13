import amqp from 'amqplib';
import { logger } from './logger';

let channel: amqp.Channel;

export const connectRabbit = async () => {
  const connection = await amqp.connect('amqp://localhost:5672');

  channel = await connection.createChannel();

  await channel.assertExchange('live.exchange', 'topic', { durable: true });
  logger.info(' RabbitMQ connected');
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ not connected yet');
  }

  return channel;
};
