import dotenv from 'dotenv';
import { connection } from './config/db.js';
import { logger } from './config/logger.js';
import app from './app.js';
import logger from '../src/utils/logger.js';
dotenv.config();



app.listen(process.env.PORT, async () => {
  await connection();
<<<<<<< HEAD
 logger.info(`Server running on port ${process.env.PORT}`);
=======
  logger.info(`Backend running on http://localhost:${process.env.PORT}`);
>>>>>>> 755fa08d06484d8622714e14787f972921c0e9c1
});
