import { db } from '@/database';

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
