import * as messageService from '@/services/messageService';
import { RequestValidator } from '@/utils/requestValidator';
import { sendResponse } from '@/utils/response';
import { firstMessageSchema } from '@/validators/messageValidators';
import type { UserDetailsDTO } from '@/validators/userValidators';
import type { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

export const getConversations: RequestHandler = async (_req, res) => {
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

export const getActiveConversation: RequestHandler = async (req, res) => {
  const { senderId, receiverId } = RequestValidator.validateParams(
    req.params,
    z.object({
      senderId: z.string().trim().min(1, 'Sender id is required'),
      receiverId: z.string().trim().min(1, 'Receiver id is required'),
    })
  );
  const conversation = await messageService.getActiveConversation(
    senderId,
    receiverId
  );
  sendResponse(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'Active conversation',
    data: conversation ?? null,
  });
};

export const sendFirstMessage: RequestHandler = async (req, res) => {
  const firstMessage = RequestValidator.validateBody(
    req.body,
    firstMessageSchema
  );
  const user = await messageService.sendFirstMessage(firstMessage);
  sendResponse<UserDetailsDTO>(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'User details',
    data: user,
  });
};
