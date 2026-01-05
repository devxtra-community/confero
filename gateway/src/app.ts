import express from 'express';
import cors from 'cors';

const app = express();
// test
app.use(cors());
app.use(express.json());

export default app;
