import { getUserConversations } from '@/services/messageService';
import type { ServerType, SocketType } from './types';
import { userSocketMap } from './utils';

export const handleConnection = async (socket: SocketType, io: ServerType) => {
  const userId = socket.data.userId;

  // Always update socket ID for the user
  userSocketMap.set(userId, socket.id);

  const conversations = await getUserConversations(userId);
  const activeFriends = conversations.reduce((active, conv) => {
    const friendId = userId === conv.user1Id ? conv.user2Id : conv.user1Id;
    if (userSocketMap.has(friendId)) active.push(friendId);
    return active;
  }, [] as string[]);

  // Store active friends in socket data for disconnect handler
  socket.data.activeFriends = activeFriends;

  socket.emit('friends:online', activeFriends);
  activeFriends.forEach(friendId => {
    const friendSocketId = userSocketMap.get(friendId);
    if (friendSocketId) io.to(friendSocketId).emit('friend:connect', userId);
  });
};

export const handleDisconnect = (socket: SocketType, io: ServerType) => {
  const userId = socket.data.userId;
  userSocketMap.delete(userId);

  const activeFriends = socket.data.activeFriends;
  activeFriends.forEach(friendId => {
    const friendSocketId = userSocketMap.get(friendId);
    if (friendSocketId) {
      io.to(friendSocketId).emit('friend:stopTyping', userId);
      io.to(friendSocketId).emit('friend:disconnect', userId);
    }
  });
};
