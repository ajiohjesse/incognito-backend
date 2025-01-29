import { db } from '@/database';
import { messages } from '@/database/dbSchemas';
import { socketMessageSchema } from '@/validators/messageValidators';
import type { ServerType, SocketType } from './types';
import { userSocketMap } from './utils';

export const handleMessage = async (
  message: unknown,
  socket: SocketType,
  io: ServerType
) => {
  const res = socketMessageSchema.safeParse(message);
  if (!res.success) {
    console.error('Invalid message:', res.error);
    return;
  }
  console.info('Message received:', {
    userId: socket.data.userId,
    message,
    socketId: socket.id,
  });

  const validatedMessage = res.data;

  const friendSocketId = userSocketMap.get(validatedMessage.receiverId);
  if (friendSocketId) {
    io.to(friendSocketId).emit('friend:message', validatedMessage);
    await db.insert(messages).values({
      conversationId: validatedMessage.conversationId,
      senderId: socket.data.userId,
      contentEncrypted: validatedMessage.contentEncrypted,
      createdAt: validatedMessage.createdAt,
    });
  }
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
