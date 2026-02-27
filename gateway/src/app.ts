import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoute.js';
import { liveProxy } from './proxies/liveProxy.js';
import helmet from 'helmet';
import userRouter from './routes/userRoute.js';
import adminRouter from './routes/adminRoute.js';
import cookieParser from 'cookie-parser';
dotenv.config();

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_URI,
  process.env.FRONTEND_URI_BARE,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use('/auth', authRouter);
app.use('/live', liveProxy);
app.use('/users', userRouter);
app.use('/admin', adminRouter);

export default app;
