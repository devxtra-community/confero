import mongoose from 'mongoose';
<<<<<<< HEAD
import logger from '../utils/logger.js';
=======
import { logger } from './logger';
>>>>>>> 755fa08d06484d8622714e14787f972921c0e9c1

export const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
<<<<<<< HEAD
    logger.info('Mongoose connected');
  } catch (err) {
   logger.error(String(err));
=======
    logger.info('Database connected successfully!');
  } catch (err: any) {
    logger.error(err, 'Database connection is corrupted');
    process.exit(1);
>>>>>>> 755fa08d06484d8622714e14787f972921c0e9c1
  }
};
