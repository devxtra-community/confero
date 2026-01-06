import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import { morganMiddleware } from './config/morgan.js';
import authRouter from './routes/authRoute.js';
import { errorHandler } from './middlewares/globalError.js';
const app = express();
// checking cd is working correct
app.use(morganMiddleware);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(errorHandler);


app.use('/auth', authRouter);
app.use(healthRouter);

export default app;
