import dotenv from 'dotenv';
import { connection } from './config/db.js';
import app from './app.js';
dotenv.config();

app.listen(process.env.PORT, async () => {
  await connection();
  console.log(`Backend running on http://localhost:${process.env.PORT}`);
});
