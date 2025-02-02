import { z } from 'zod';

export const createUserSchema = z.object({
  deviceFingerprint: z.string().trim().min(1, 'Device fingerprint is required'),
  publicKey: z.string().trim().min(1, 'Public key is required'),
});
export type CreateUserDTO = z.infer<typeof createUserSchema>;

export const UserDetailsSchema = z.object({
  id: z.string(),
  username: z.string(),
  publicKey: z.string(),
  createdAt: z.string(),
});
export type UserDetailsDTO = z.infer<typeof UserDetailsSchema>;

export type UserHandshakeDTO = {
  id: string;
  username: string;
  publicKey: string;
};
