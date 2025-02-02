import { db } from '@/database';
import { conversations, messages, users } from '@/database/dbSchemas';
import type {
  FirstAuthenticatedMessageDTO,
  FirstMessageDTO,
} from '@/validators/messageValidators';
import { and, desc, eq, ne, or } from 'drizzle-orm';
import { createUser } from './userService';

export function getUserConversations(userId: string) {
  return db.query.conversations.findMany({
    where(table, func) {
      return func.or(
        func.eq(table.user1Id, userId),
        func.eq(table.user2Id, userId)
      );
    },
    with: {
      user_user1Id: {
        columns: {
          id: true,
          username: true,
          publicKey: true,
        },
      },
      user_user2Id: {
        columns: {
          id: true,
          username: true,
          publicKey: true,
        },
      },
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

export function getActiveConversation(conversationId: string) {
  return db.query.conversations.findFirst({
    where: (table, { eq }) => eq(table.id, conversationId),
    with: {
      user_user1Id: {
        columns: {
          id: true,
          username: true,
          publicKey: true,
        },
      },
      user_user2Id: {
        columns: {
          id: true,
          username: true,
          publicKey: true,
        },
      },
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
    encryptionIV,
  } = message;

  //clear the previous user record if it exists
  //this is because auth is based on deviceFingerprint
  //and the conversation private keys are stored on the client
  //and can be lost at any time
  await db.delete(users).where(eq(users.deviceFingerprint, deviceFingerprint));
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
    encryptionIV,
  });

  return conversation;
}

export function getMessages(userId: string) {
  return db
    .select({
      message: messages,
      sender: {
        id: users.id,
        username: users.username,
      },
      conversation: conversations,
    })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .innerJoin(users, eq(messages.senderId, users.id))
    .where(
      and(
        or(
          eq(conversations.user1Id, userId),
          eq(conversations.user2Id, userId)
        ),
        ne(messages.senderId, userId)
      )
    )
    .orderBy(desc(messages.createdAt));
}

export function getConversationWithFriend(userId: string, friendId: string) {
  return db.query.conversations.findFirst({
    where: (table, { and, or, eq }) => {
      return or(
        and(eq(table.user1Id, userId), eq(table.user2Id, friendId)),
        and(eq(table.user1Id, friendId), eq(table.user2Id, userId))
      );
    },
  });
}

export async function firstAuthenticatedMessage(
  userId: string,
  data: FirstAuthenticatedMessageDTO
) {
  const [conversation] = await db
    .insert(conversations)
    .values({
      user1Id: userId,
      user2Id: data.friendId,
      sharedKeyEncryptedByUser1: data.sharedKeyEncryptedByUser1,
      sharedKeyEncryptedByUser2: data.sharedKeyEncryptedByUser2,
    })
    .returning();

  await db.insert(messages).values({
    conversationId: conversation.id,
    senderId: userId,
    contentEncrypted: data.contentEncrypted,
    encryptionIV: data.encryptionIV,
  });

  return conversation;
}
