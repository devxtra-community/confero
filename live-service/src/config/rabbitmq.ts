import * as amqp from 'amqplib';
import { logger } from './logger';
import { rabbitConfig } from './rabbitmqConfig';

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;
let isConnecting = false;

export const connectRabbit = async (): Promise<void> => {
  if (isConnecting) {
    logger.warn('Already attempting to connect to RabbitMQ');
    return;
  }

  try {
    isConnecting = true;

    const url = rabbitConfig.url;

    const isTLS = url.startsWith('amqps://');

    const connectionOptions: any = {
      heartbeat: rabbitConfig.options.heartbeat,
      clientProperties: {
        connection_name: 'confero-live-service',
      },
    };

    if (isTLS) {
      const parsed = new URL(url);

      connectionOptions.servername = parsed.hostname;

      connectionOptions.rejectUnauthorized = false;
    }

    connection = await amqp.connect(url, connectionOptions);

    connection.on('error', err => {
      logger.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed. Reconnecting...');
      connection = null;
      channel = null;
      setTimeout(connectRabbit, rabbitConfig.reconnectDelay);
    });

    channel = await connection.createChannel();

    await channel.prefetch(rabbitConfig.prefetch);

    channel.on('error', err => {
      logger.error('RabbitMQ channel error:', err);
    });

    channel.on('close', () => {
      logger.warn('RabbitMQ channel closed');
      channel = null;
    });

    await channel.assertExchange('live.exchange', 'topic', { durable: true });

    logger.info('RabbitMQ connected successfully');
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error);

    connection = null;
    channel = null;

    setTimeout(connectRabbit, rabbitConfig.reconnectDelay);
  } finally {
    isConnecting = false;
  }
};

export const getChannel = (): amqp.Channel => {
  if (!channel) {
    throw new Error('RabbitMQ channel not available');
  }
  return channel;
};

export const closeConnection = async (): Promise<void> => {
  try {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
    logger.info('RabbitMQ connection closed');
  } catch (error) {
    logger.error('Error closing RabbitMQ connection:', error);
  }
};
