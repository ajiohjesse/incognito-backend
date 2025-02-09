import { db } from '@/database';
import { messages } from '@/database/dbSchemas';
import { sendNewMessagePushNotification } from '@/utils/pusher';
import { socketMessageSchema } from '@/validators/messageValidators';
import type { ServerType, SocketType } from './types';
import { userSocketMap } from './utils';

export const handleMessage = async (
  message: unknown,
  cb: (sent: boolean, message?: string) => void,
  socket: SocketType,
  io: ServerType
) => {
  const res = socketMessageSchema.safeParse(message);
  if (!res.success) {
    cb(false, 'Invalid message');
    return;
  }

  const validatedMessage = res.data;

  const receiver = await db.query.users.findFirst({
    where: (table, fn) => fn.eq(table.id, validatedMessage.receiverId),
  });

  if (!receiver || receiver.deletedAt !== null) {
    cb(
      false,
      'The acount your are trying to message does not exist or may have been deleted.'
    );
    return;
  }

  const [createdMessage] = await db
    .insert(messages)
    .values({
      conversationId: validatedMessage.conversationId,
      senderId: socket.data.userId,
      contentEncrypted: validatedMessage.contentEncrypted,
      encryptionIV: validatedMessage.encryptionIV,
    })
    .returning();

  const friendSocketId = userSocketMap.get(validatedMessage.receiverId);
  if (friendSocketId) {
    io.to(friendSocketId).emit('friend:message', createdMessage);
  }

  sendNewMessagePushNotification({
    targetUserId: receiver.id,
    fromUsername: socket.data.username,
    conversationId: createdMessage.conversationId,
  });

  cb(true);
};

export const handleIsTyping = (
  friendId: unknown,
  socket: SocketType,
  io: ServerType
) => {
  if (typeof friendId !== 'string') {
    console.error('Invalid friend id:', friendId);
    return;
  }
  const userId = socket.data.userId;
  const friendSocketId = userSocketMap.get(friendId);
  if (friendSocketId) {
    io.to(friendSocketId).emit('friend:typing', userId);
  }
};

export const handleStopTyping = (
  friendId: unknown,
  socket: SocketType,
  io: ServerType
) => {
  if (typeof friendId !== 'string') {
    console.error('Invalid friend id:', friendId);
    return;
  }
  const userId = socket.data.userId;
  const friendSocketId = userSocketMap.get(friendId);
  if (friendSocketId) {
    io.to(friendSocketId).emit('friend:stopTyping', userId);
  }
};
