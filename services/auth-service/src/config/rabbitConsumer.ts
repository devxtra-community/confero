import * as amqp from 'amqplib';
import { env } from './env.js';
import { logger } from './logger.js';
import { SessionModel } from '../models/sessionModel.js';

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

export const startRabbitConsumer = async () => {
  try {
    const url = env.RABBITMQ_URL!;

    connection = await amqp.connect(url, {
      heartbeat: 60,
      clientProperties: {
        connection_name: 'confero-auth-consumer',
      },
    });

    connection.on('error', err => {
      logger.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed');
    });

    channel = await connection.createChannel();

    const exchange = 'live.exchange';
    const queue = 'session.queue';

    await channel.assertExchange(exchange, 'topic', { durable: true });

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.bindQueue(queue, exchange, 'session.*');

    logger.info('RabbitMQ consumer started...');

    await channel.consume(queue, async msg => {
      if (!msg) return;

      try {
        const routingKey = msg.fields.routingKey;
        const data = JSON.parse(msg.content.toString());

        logger.info(`Received event ${routingKey}`, data);

        if (routingKey === 'session.started') {
          await SessionModel.create({
            sessionId: data.sessionId,
            userA: data.userA,
            userB: data.userB,
            startedAt: data.startedAt,
          });
        }

        if (routingKey === 'session.ended') {
          await SessionModel.findOneAndUpdate(
            { sessionId: data.sessionId },
            {
              endedAt: data.endedAt,
              endReason: data.reason,
            }
          );
        }

        channel!.ack(msg);
      } catch (err) {
        logger.error('Consumer error', err);

        channel!.nack(msg, false, false);
      }
    });
  } catch (error) {
    logger.error('Failed to start RabbitMQ consumer:', error);

    setTimeout(() => {
      startRabbitConsumer();
    }, 5000);
  }
};
