import app from './app.js';
import routes from './routes/index.js';

app.use('/', routes);

app.listen(4000, () => {
  console.log('API Gateway running on http://localhost:4000');
});
