import dotenv from 'dotenv';
import { connection } from './config/db.js';
import { logger } from './config/logger.js';
import app from './app.js';
dotenv.config();

app.listen(process.env.PORT, async () => {
  await connection();
  logger.info(`Backend running on http://localhost:${process.env.PORT}`);
});
