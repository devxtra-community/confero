import express from 'express';
import healthRouter from './routes/health.js';
import { morganMiddleware } from './config/morgan.js';
import authRouter from './routes/authRoute.js';
import { errorHandler } from './middlewares/globalError.js';
import cookieParser from 'cookie-parser';

const app = express();
// checking cd is working correct
app.use(morganMiddleware);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(healthRouter);
app.get('/debug-cookies', (req, res) => {
  res.json(req.cookies);
});

app.use('/auth', authRouter);

app.use(errorHandler);

export default app;
