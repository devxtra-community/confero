import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health.js';
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(healthRouter);

export default app;
