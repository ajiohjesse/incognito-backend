import { sql } from 'drizzle-orm';
import { timestamp, uuid } from 'drizzle-orm/pg-core';

export const tableId = uuid()
  .primaryKey()
  .default(sql`gen_random_uuid()`);

export const timestamps = {
  createdAt: timestamp({ mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp({ mode: 'string' })
    .defaultNow()
    .notNull()
    .$onUpdate(() => sql`NOW()`),
};
