import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

if (process.env.NODE_ENV !== "production") {
  setInterval(() => {
    const mem = process.memoryUsage();

    console.log("[MEMORY]", {
      rss: Math.round(mem.rss / 1024 / 1024) + " MB",
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + " MB",
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024) + " MB",
    });
  }, 10000); // every 10s
}


app.listen(env.PORT, () => {
  logger.info(`Live-service server is running in ${env.LIVE_SERVICE}`);
});
