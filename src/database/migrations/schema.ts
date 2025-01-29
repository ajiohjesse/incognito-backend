import { sql } from 'drizzle-orm';
import {
  boolean,
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { customAlphabet } from 'nanoid';
import { generateUsername } from 'unique-username-generator';
const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 8);

export const users = pgTable(
  'users',
  {
    id: text().$defaultFn(nanoid).primaryKey().notNull(),
    username: text()
      .$defaultFn(() => generateUsername('-', 3))
      .notNull(),
    deviceFingerprint: text('device_fingerprint').notNull().unique(),
    publicKey: text('public_key').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  table => [
    {
      usernameIdx: index('idx_users_username').on(table.username),
      deviceFingerprintIdx: index('idx_users_device_fingerprint').on(
        table.deviceFingerprint
      ),
    },
  ]
);

export const conversations = pgTable(
  'conversations',
  {
    id: text()
      .default(sql`gen_random_uuid()`)
      .primaryKey()
      .notNull(),
    user1Id: text('user1_id').notNull(),
    user2Id: text('user2_id').notNull(),
    sharedKeyEncryptedByUser1: text('shared_key_encrypted_by_user1').notNull(),
    sharedKeyEncryptedByUser2: text('shared_key_encrypted_by_user2').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  table => [
    index('idx_conversations_user1').using(
      'btree',
      table.user1Id.asc().nullsLast().op('text_ops')
    ),
    index('idx_conversations_user2').using(
      'btree',
      table.user2Id.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.user1Id],
      foreignColumns: [users.id],
      name: 'conversations_user1_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.user2Id],
      foreignColumns: [users.id],
      name: 'conversations_user2_id_fkey',
    }).onDelete('cascade'),
    unique('conversations_user1_id_user2_id_key').on(
      table.user1Id,
      table.user2Id
    ),
  ]
);

export const messages = pgTable(
  'messages',
  {
    id: text()
      .default(sql`gen_random_uuid()`)
      .primaryKey()
      .notNull(),
    conversationId: text('conversation_id').notNull(),
    senderId: text('sender_id').notNull(),
    contentEncrypted: text('content_encrypted').notNull(),
    isDelivered: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  table => [
    index('idx_messages_conversation').using(
      'btree',
      table.conversationId.asc().nullsLast().op('text_ops')
    ),
    index('idx_messages_sender').using(
      'btree',
      table.senderId.asc().nullsLast().op('text_ops')
    ),
    foreignKey({
      columns: [table.conversationId],
      foreignColumns: [conversations.id],
      name: 'messages_conversation_id_fkey',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.senderId],
      foreignColumns: [users.id],
      name: 'messages_sender_id_fkey',
    }).onDelete('set null'),
  ]
);
