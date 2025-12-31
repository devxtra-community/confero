import mongoose from 'mongoose';
import logger from '../utils/logger.js';

export const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    logger.info('Mongoose connected');
  } catch (err) {
   logger.error(String(err));
  }
};


