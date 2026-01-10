import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/authRoute.js';
dotenv.config();

const app = express();
// test
app.use(cors({
  origin:process.env.FRONTEND_URI,
  credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRouter);

export default app;
