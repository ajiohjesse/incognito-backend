import PushNotifications from '@pusher/push-notifications-server';
import { env } from './env';

export const beamsClient = new PushNotifications({
  instanceId: env.PUSHER_ID,
  secretKey: env.PUSHER_SECRET,
});

export function sendNewMessagePushNotification({
  targetUserId,
  fromUsername,
  conversationId,
}: {
  targetUserId: string;
  fromUsername: string;
  conversationId: string;
}) {
  beamsClient.publishToUsers([targetUserId], {
    web: {
      notification: {
        title: 'New message',
        body: `You have a new anonymous message from ${fromUsername}`,
        deep_link: `${env.CORS_ORIGIN}/u/messages/${conversationId}`,
      },
    },
  });
}
