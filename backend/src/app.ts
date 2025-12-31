import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
import { morganMiddleware } from './config/morgan.js';
const app = express();

app.use(morganMiddleware)
app.use(cors());    
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(healthRouter);


export default app;
