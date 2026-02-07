import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoute.js';
import { liveProxy } from './proxies/liveProxy.js';
import helmet from 'helmet';
import userRouter from './routes/userRoute.js';
dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
  })
);
app.use(helmet());

app.use('/auth', authRouter);
app.use('/live', liveProxy);
app.use('/users', userRouter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export default app;
