import { getChannel } from '../config/rabbitmq';

export const publishEvent = async (routingKey: string, payload: any) => {
  const channel = getChannel();

  console.log('rabbit is getiing the event');

  channel.publish(
    'live.exchange',
    routingKey,
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
    }
  );
};
