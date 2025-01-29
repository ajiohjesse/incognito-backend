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
  }),
  createUserSchema
);
export type FirstMessageDTO = z.infer<typeof firstMessageSchema>;

export const socketMessageSchema = z.object({
  conversationId: z.string().trim().min(1, 'Conversation id is required'),
  receiverId: z.string().trim().min(1, 'Receiver id is required'),
  contentEncrypted: z.string().trim().min(1, 'Message content is required'),
  createdAt: z.string().date(),
});

export type SocketMessageDTO = z.infer<typeof socketMessageSchema>;
