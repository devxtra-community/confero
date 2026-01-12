import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Live-service server is running in ${env.LIVE_SERVICE}`);
});
