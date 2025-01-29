import * as messageService from '@/services/messageService';
import { sendResponse } from '@/utils/response';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';

export const getConversations: RequestHandler = async (req, res) => {
  const conversations = await messageService.getUserConversations(
    res.locals.userId
  );
  sendResponse(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'Conversations',
    data: {
      conversations,
    },
  });
};

export const getConversationMessages: RequestHandler = async (req, res) => {
  const conversationId = req.params.conversationId;
  const messages = await messageService.getConversationMessages(conversationId);
  sendResponse(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'Conversation messages',
    data: {
      messages,
    },
  });
};

// export const sendFirstMessage: RequestHandler
