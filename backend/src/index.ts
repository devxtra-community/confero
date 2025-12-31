import dotenv from 'dotenv';
import { connection } from './config/db.js';
import app from './app.js';
import logger from '../src/utils/logger.js';
dotenv.config();



app.listen(process.env.PORT, async () => {
  await connection();
 logger.info(`Server running on port ${process.env.PORT}`);
});
