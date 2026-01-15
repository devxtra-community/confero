import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT || 4001),
  JWT_SECRET: process.env.JWT_SECRET!,
  REDIS_URL: process.env.REDIS_URL!,
  LIVE_SERVICE: process.env.LIVE_SERVICE!,
  FRONTEND_URI: process.env.FRONTEND_URI!,
};
