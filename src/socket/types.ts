import type { SocketMessageDTO } from '@/validators/messageValidators';
import { Server, Socket } from 'socket.io';

interface ServerToClientEvents {
  'friends:online': (friends: string[]) => void;
  'friend:disconnect': (friendId: string) => void;
  'friend:connect': (friendId: string) => void;
  'friend:message': (message: SocketMessageDTO) => void;
  'friend:typing': (friendId: string) => void;
  'friend:stopTyping': (friendId: string) => void;
}

interface ClientToServerEvents {
  'user:message': (message: unknown) => void;
  'user:typing': (friendId: unknown) => void;
  'user:stopTyping': (friendId: unknown) => void;
}

export interface SocketData {
  userId: string;
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
