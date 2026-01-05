import dotenv from 'dotenv';
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 4040,
  MONGO_URI: process.env.MONGO_URI!,
  JWT_SECRET: process.env.JWT_SECRET!,
};
