import { relations } from 'drizzle-orm/relations';
import { conversations, messages, users } from './schema';

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user_user1Id: one(users, {
      fields: [conversations.user1Id],
      references: [users.id],
      relationName: 'conversations_user1Id_users_id',
    }),
    user_user2Id: one(users, {
      fields: [conversations.user2Id],
      references: [users.id],
      relationName: 'conversations_user2Id_users_id',
    }),
    messages: many(messages),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  conversations_user1Id: many(conversations, {
    relationName: 'conversations_user1Id_users_id',
  }),
  conversations_user2Id: many(conversations, {
    relationName: 'conversations_user2Id_users_id',
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
