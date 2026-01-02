import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    logger.info('Database connected successfully!');
  } catch (err: any) {
    logger.error(err, 'Database connection is corrupted');
    process.exit(1);
  }
};