import { env } from '@/utils/env';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './dbSchemas';

export const db = drizzle(env.DATABASE_URL, {
  casing: 'snake_case',
  schema,
  logger: !env.isProduction,
});
