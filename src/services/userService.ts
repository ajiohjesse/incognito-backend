import { db } from '@/database';
import { users } from '@/database/dbSchemas';
import type { CreateUserDTO } from '@/validators/userValidators';

export function getUserById(userId: string) {
  return db.query.users.findFirst({
    where(table, func) {
      return func.eq(table.id, userId);
    },
  });
}

export function getUserByFingerprint(deviceFingerprint: string) {
  return db.query.users.findFirst({
    where(table, func) {
      return func.eq(table.deviceFingerprint, deviceFingerprint);
    },
  });
}

export async function createUser(user: CreateUserDTO) {
  const [createdUser] = await db.insert(users).values(user).returning();
  return createdUser;
}
