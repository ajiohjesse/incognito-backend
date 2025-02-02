import * as messageController from '@/controllers/messageController';
import { authMiddleware } from '@/middleware/authMiddleware';
import { Router } from 'express';

const route = Router();
export { route as messageRoute };

route.get('/', authMiddleware, messageController.getConversations);
route.get(
  '/messages/:conversationId',
  authMiddleware,
  messageController.getConversationMessages
);
route.get(
  '/:conversationId',
  authMiddleware,
  messageController.getActiveConversation
);
route.get('/user/messages/all', authMiddleware, messageController.getMessages);
route.post('/messages', messageController.sendFirstMessage);
route.post('/', authMiddleware, messageController.firstAuthenticatedMessage);
route.get(
  '/friends/:friendId',
  authMiddleware,
  messageController.getConversationWithFriend
);
