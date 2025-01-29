import { db } from '@/database';
import { conversations, messages } from '@/database/dbSchemas';
import type { FirstMessageDTO } from '@/validators/messageValidators';
import { createUser } from './userService';

export function getUserConversations(userId: string) {
  return db.query.conversations.findMany({
    where(table, func) {
      return func.or(
        func.eq(table.user1Id, userId),
        func.eq(table.user2Id, userId)
      );
    },
  });
}

export function getConversationMessages(conversationId: string) {
  return db.query.messages.findMany({
    where(table, func) {
      return func.eq(table.conversationId, conversationId);
    },
  });
}

export function getActiveConversation(senderId: string, receiverId: string) {
  return db.query.conversations.findFirst({
    where(table, func) {
      return func.or(
        func.or(
          func.eq(table.user1Id, senderId),
          func.eq(table.user2Id, receiverId)
        ),
        func.or(
          func.eq(table.user1Id, receiverId),
          func.eq(table.user2Id, senderId)
        )
      );
    },
  });
}

export async function sendFirstMessage(message: FirstMessageDTO) {
  const {
    contentEncrypted,
    receipientId,
    sharedKeyEncryptedByUser1,
    sharedKeyEncryptedByUser2,
    deviceFingerprint,
    publicKey,
  } = message;

  const user = await createUser({ deviceFingerprint, publicKey });

  const [conversation] = await db
    .insert(conversations)
    .values({
      user1Id: user.id,
      user2Id: receipientId,
      sharedKeyEncryptedByUser1,
      sharedKeyEncryptedByUser2,
    })
    .returning();

  await db.insert(messages).values({
    conversationId: conversation.id,
    senderId: user.id,
    contentEncrypted,
  });

  return user;
}
