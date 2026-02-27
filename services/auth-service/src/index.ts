import 'express-async-errors';
import dotenv from 'dotenv';
import { connection } from './config/db.js';
import { logger } from './config/logger.js';
import { loadBansIntoRedis } from './utils/loadBansIntoRedis.js';
import app from './app.js';
import './config/redis.js';
import { startRabbitConsumer } from './config/rabbitConsumer.js';

dotenv.config();

const start = async () => {
  try {
    await connection();
    logger.info('Database connected');

    await loadBansIntoRedis();
    logger.info('Redis initialized');

    await startRabbitConsumer();
    logger.info('RabbitMQ connected');

    app.listen(process.env.PORT, () => {});
  } catch (err) {
    logger.error('Startup failed:', err);
    process.exit(1);
  }
};

start();
