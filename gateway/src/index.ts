import app from './app.js';


app.listen(process.env.PORT, () => {
  console.log(`API Gateway running on ${process.env.GATEWAY_URL}`);
});
