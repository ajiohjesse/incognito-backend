import * as messageController from '@/controllers/messageController';
import { authMiddleware } from '@/middleware/authMiddleware';
import { Router } from 'express';

const route = Router();
export { route as messageRoute };

route.get('/', authMiddleware, messageController.getConversations);
route.get(
  '/:conversationId',
  authMiddleware,
  messageController.getConversationMessages
);
