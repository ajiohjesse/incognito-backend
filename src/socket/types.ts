import { Server, Socket } from 'socket.io';

interface MessageReceived {
  conversationId: string;
  contentEncrypted: string;
  encryptionIV: string;
  createdAt: string;
  senderId: string;
  id: string;
  isDelivered: boolean;
}

interface ServerToClientEvents {
  'friends:online': (friends: string[]) => void;
  'friend:disconnect': (friendId: string) => void;
  'friend:connect': (friendId: string) => void;
  'friend:message': (message: MessageReceived) => void;
  'friend:typing': (friendId: string) => void;
  'friend:stopTyping': (friendId: string) => void;
}

interface ClientToServerEvents {
  'user:message': (
    message: unknown,
    cb: (sent: boolean, message?: string) => void
  ) => void;
  'user:typing': (friendId: unknown) => void;
  'user:stopTyping': (friendId: unknown) => void;
}

export interface SocketData {
  userId: string;
  username: string;
  activeFriends: string[];
}

export type SocketType = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;

export type ServerType = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  {},
  SocketData
>;
