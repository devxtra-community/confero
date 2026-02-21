export const rabbitConfig = (() => {
  const url = process.env.RABBITMQ_URL!;

  const isTLS = url.startsWith('amqps://');

  return {
    url,
    options: {
      heartbeat: 60,

      ...(isTLS && {
        clientProperties: {
          connection_name: 'confero-live-service',
        },
      }),
    },

    reconnectDelay: 5000,
    prefetch: 10,
  };
})();
