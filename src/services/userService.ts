import { db } from '@/database';
import { users } from '@/database/dbSchemas';
import type { CreateUserDTO } from '@/validators/userValidators';
import { eq, sql } from 'drizzle-orm';

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
  const existingUser = await getUserByFingerprint(user.deviceFingerprint);
  if (existingUser) {
    console.log('FOund prev user, deleting record');
    //soft delete previous account
    await db
      .update(users)
      .set({
        deviceFingerprint: crypto.randomUUID(),
        deletedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(users.id, existingUser.id));
  }
  const [createdUser] = await db.insert(users).values(user).returning();
  return createdUser;
}

export async function deleteUser(userId: string) {
  await db
    .update(users)
    .set({
      deviceFingerprint: crypto.randomUUID(),
      deletedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(users.id, userId));
}
