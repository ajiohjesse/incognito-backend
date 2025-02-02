import { getUserByFingerprint } from '@/services/userService';
import { type SocketType } from './types';

export const authenticateSocket = async (socket: SocketType) => {
  const deviceFingerPrint = socket.handshake.auth.deviceFingerprint;
  if (!deviceFingerPrint || typeof deviceFingerPrint !== 'string') {
    throw new Error('Invalid device fingerprint');
  }

  const user = await getUserByFingerprint(deviceFingerPrint);
  if (!user) {
    throw new Error('User not found');
  }

  socket.data.userId = user.id;
  socket.data.username = user.username;
  return user;
};
