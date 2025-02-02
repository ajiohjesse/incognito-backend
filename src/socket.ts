import http from 'http';
import { Server } from 'socket.io';
import { app } from './app';
import { authenticateSocket } from './socket/authHandler';
import { handleConnection, handleDisconnect } from './socket/connectionHandler';
import {
  handleIsTyping,
  handleMessage,
  handleStopTyping,
} from './socket/messageHandler';
import type { ServerType, SocketType } from './socket/types';
import { env } from './utils/env';

export const server = http.createServer(app);
export const io: ServerType = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', async (socket: SocketType) => {
  try {
    await authenticateSocket(socket);
    await handleConnection(socket, io);

    socket.on('disconnect', () => handleDisconnect(socket, io));
    socket.on('user:message', (message, cb) =>
      handleMessage(message, cb, socket, io)
    );
    socket.on('user:typing', friendId => handleIsTyping(friendId, socket, io));
    socket.on('user:stopTyping', friendId =>
      handleStopTyping(friendId, socket, io)
    );
  } catch (error) {
    console.error('Connection error:', error);
    socket.disconnect(true);
  }
});
