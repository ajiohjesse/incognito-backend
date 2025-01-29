import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { getUserConversations } from './services/messageService';
import { getUserByFingerprint } from './services/userService';
import { env } from './utils/env';

interface ServerToClientEvents {
  noArg: () => void;
  activeFriends: (friends: string[]) => void;
  friendConnected: (friendId: string) => void;
  friendDisconnected: (friendId: string) => void;
}

interface ClientToServerEvents {
  noArg: () => void;
}

interface SocketData {
  userId: string;
}

export const server = http.createServer(app);

export const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

//used to store online users
const userSocketMap = new Map<string, string>();

io.on('connection', async socket => {
  const deviceFingerPrint = socket.handshake.auth.deviceFingerprint;
  if (!deviceFingerPrint || typeof deviceFingerPrint !== 'string') {
    console.info('Invalid socket connection, DeviceId is required');
    socket.disconnect(true);
    return;
  }
  const user = await getUserByFingerprint(deviceFingerPrint);

  if (!user) {
    console.info('No user is found for this device.');
    socket.disconnect(true);
    return;
  }

  const userId = user.id;

  if (!userSocketMap.has(userId)) {
    userSocketMap.set(userId, socket.id);
    socket.data.userId = userId;
    console.log('user connected');
    console.info('A user connected: ', {
      userId,
      socketId: socket.id,
    });
  }

  //retrieve all conversations for the user and find the active friends
  const conversations = await getUserConversations(userId);
  const activeFriends = conversations.reduce((active, conv) => {
    const friendId = userId === conv.user1Id ? conv.user2Id : conv.user1Id;
    if (userSocketMap.has(friendId)) {
      active.push(friendId);
    }
    return active;
  }, [] as string[]);

  socket.emit('activeFriends', activeFriends);

  //inform all active friends that the user connected
  activeFriends.forEach(friendId => {
    const friendSocketId = getReceiverSocketId(friendId);
    if (friendSocketId) {
      io.to(friendSocketId).emit('friendConnected', userId);
    }
  });

  socket.on('disconnect', () => {
    userSocketMap.delete(userId);

    //find all active friends and tell them the user disconnected
    activeFriends.forEach(friendId => {
      const friendSocketId = getReceiverSocketId(friendId);
      if (friendSocketId) {
        io.to(friendSocketId).emit('friendDisconnected', userId);
      }
    });
    console.info('A user disconnected: ', {
      userId,
      socketId: socket.id,
    });
  });
});

export function getReceiverSocketId(userId: string) {
  return userSocketMap.get(userId);
}

// io.on();
