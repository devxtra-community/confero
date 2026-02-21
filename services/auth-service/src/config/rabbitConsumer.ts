import * as amqp from 'amqplib';
import { env } from './env.js';
import { logger } from './logger.js';
import { SessionModel } from '../models/sessionModel.js';

export const startRabbitConsumer = async () => {
  const url = env.RABBITMQ_URL!;
  const isTLS = url.startsWith('amqps://');

  const connectionOptions: any = {
    heartbeat: 60,
    clientProperties: {
      connection_name: 'confero-auth-consumer',
    },
  };

  if (isTLS) {
    const parsed = new URL(url);

    connectionOptions.servername = parsed.hostname;

    connectionOptions.rejectUnauthorized = false;

    connectionOptions.ssl = {
      servername: parsed.hostname,
    };
  }

  const connection = await amqp.connect(url, connectionOptions);
  const channel = await connection.createChannel();

  const exchange = 'live.exchange';
  const queue = 'session.queue';

  await channel.assertExchange(exchange, 'topic', { durable: true });
  await channel.assertQueue(queue, { durable: true });

  await channel.bindQueue(queue, exchange, 'session.*');

  logger.info('RabbitMQ consumer started..');

  channel.consume(queue, async msg => {
    if (!msg) return;

    const routingKey = msg.fields.routingKey;
    const data = JSON.parse(msg.content.toString());

    logger.info(routingKey, data);

    try {
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

      channel.ack(msg);
    } catch (err) {
      logger.error('Consumer error', err);
    }
  });
};
