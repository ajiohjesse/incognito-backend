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
