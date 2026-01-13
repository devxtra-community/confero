import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Live-service server is running in ${env.LIVE_SERVICE}`);
});
