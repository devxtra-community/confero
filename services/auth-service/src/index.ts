import 'express-async-errors';
import dotenv from 'dotenv';
import { connection } from './config/db.js';
import { logger } from './config/logger.js';
import { loadBansIntoRedis } from './utils/loadBansIntoRedis.js';
import app from './app.js';
import './config/redis.js';
import { startRabbitConsumer } from './config/rabbitConsumer.js';

dotenv.config();

app.listen(process.env.PORT, async () => {
  await connection();
  logger.info(`Backend running on http://localhost:${process.env.PORT}`);
  await loadBansIntoRedis();
  await startRabbitConsumer();
});
