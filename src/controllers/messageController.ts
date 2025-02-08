import * as messageService from '@/services/messageService';
import { io } from '@/socket';
import { userSocketMap } from '@/socket/utils';
import { sendNewMessagePushNotification } from '@/utils/pusher';
import { RequestValidator } from '@/utils/requestValidator';
import { sendResponse } from '@/utils/response';
import {
  firstAuthenticatedMessageSchema,
  firstMessageSchema,
} from '@/validators/messageValidators';
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
  const { conversationId } = RequestValidator.validateParams(
    req.params,
    z.object({
      conversationId: z.string().trim().min(1, 'Sender id is required'),
    })
  );
  const conversation =
    await messageService.getActiveConversation(conversationId);
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
  const { conversation, user } =
    await messageService.sendFirstMessage(firstMessage);
  const userId = user.id;

  //emit socket event
  const friendId =
    conversation.user1Id === userId
      ? conversation.user2Id
      : conversation.user1Id;

  const friendSocketId = userSocketMap.get(friendId);
  if (friendSocketId) {
    io.to(friendSocketId).emit('friend:message', {
      conversationId: conversation.id,
    });
  }

  //send push notification
  sendNewMessagePushNotification({
    targetUserId: friendId,
    fromUsername: user.username,
    conversationId: conversation.id,
  });

  sendResponse(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'User details',
    data: {
      conversationId: conversation.id,
    },
  });
};

export const getMessages: RequestHandler = async (_req, res) => {
  const userId = res.locals.userId;
  const messages = await messageService.getMessages(userId);
  sendResponse(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'Messages',
    data: {
      messages: messages.map(message => ({
        ...message.message,
        senderUsername: message.sender.username,
        userSharedKeyEncrypted:
          message.conversation.user1Id === userId
            ? message.conversation.sharedKeyEncryptedByUser1
            : message.conversation.sharedKeyEncryptedByUser2,
      })),
    },
  });
};

export const getConversationWithFriend: RequestHandler = async (req, res) => {
  const userId = res.locals.userId;
  const { friendId } = RequestValidator.validateParams(
    req.params,
    z.object({
      friendId: z.string().trim().min(1, 'Friend id is required'),
    })
  );

  const conversation = await messageService.getConversationWithFriend(
    userId,
    friendId
  );

  sendResponse(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'Conversation',
    data: {
      conversation: conversation ?? null,
    },
  });
};

export const firstAuthenticatedMessage: RequestHandler = async (req, res) => {
  const userId = res.locals.userId;
  const data = RequestValidator.validateBody(
    req.body,
    firstAuthenticatedMessageSchema
  );

  if (userId === data.friendId) {
    sendResponse(res, {
      type: 'error',
      statusCode: StatusCodes.BAD_REQUEST,
      message: 'You cannot send a message to yourself',
    });
    return;
  }

  const conversation = await messageService.firstAuthenticatedMessage(
    userId,
    data
  );

  //emit socket event
  const friendId =
    conversation.user1Id === userId
      ? conversation.user2Id
      : conversation.user1Id;

  const friendSocketId = userSocketMap.get(friendId);
  if (friendSocketId) {
    io.to(friendSocketId).emit('friend:message', {
      conversationId: conversation.id,
    });
  }

  //send push notification
  sendNewMessagePushNotification({
    targetUserId: friendId,
    fromUsername: res.locals.username,
    conversationId: conversation.id,
  });

  sendResponse(res, {
    type: 'success',
    statusCode: StatusCodes.OK,
    message: 'Message sent',
    data: {
      conversation,
    },
  });
};
