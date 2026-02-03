import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoute.js';
import { liveProxy } from './proxies/liveProxty.js';
import helmet from 'helmet';
import userRouter from './routes/userRoute.js';
dotenv.config();

const app = express();
// test
app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);
app.use('/live', liveProxy);
app.use('/users', userRouter);

export default app;
