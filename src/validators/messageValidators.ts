import { z } from 'zod';
import { createUserSchema } from './userValidators';

export const firstMessageSchema = z.intersection(
  z.object({
    receipientId: z.string().trim().min(1, 'Recipient id is required'),
    contentEncrypted: z.string().trim().min(1, 'Message content is required'),
    sharedKeyEncryptedByUser1: z
      .string()
      .trim()
      .min(1, 'Shared key 1 is required'),
    sharedKeyEncryptedByUser2: z
      .string()
      .trim()
      .min(1, 'Shared key 2 is required'),
    encryptionIV: z.string().trim().min(1, 'Encryption IV is required'),
  }),
  createUserSchema
);
export type FirstMessageDTO = z.infer<typeof firstMessageSchema>;

export const socketMessageSchema = z.object({
  conversationId: z.string().trim().min(1, 'Conversation id is required'),
  receiverId: z.string().trim().min(1, 'Receiver id is required'),
  contentEncrypted: z.string().trim().min(1, 'Message content is required'),
  encryptionIV: z.string().trim().min(1, 'Encryption IV is required'),
  createdAt: z.string().datetime(),
});

export type SocketMessageDTO = z.infer<typeof socketMessageSchema>;

export const firstAuthenticatedMessageSchema = z.object({
  friendId: z.string().trim().min(1, 'Friend id is required'),
  sharedKeyEncryptedByUser1: z
    .string()
    .trim()
    .min(1, 'Shared key 1 is required'),
  sharedKeyEncryptedByUser2: z
    .string()
    .trim()
    .min(1, 'Shared key 2 is required'),
  contentEncrypted: z.string().trim().min(1, 'Message content is required'),
  encryptionIV: z.string().trim().min(1, 'Encryption IV is required'),
});

export type FirstAuthenticatedMessageDTO = z.infer<
  typeof firstAuthenticatedMessageSchema
>;
