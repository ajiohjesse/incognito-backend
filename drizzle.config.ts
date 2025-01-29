/* eslint-disable no-process-env */
import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

const envPath = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envPath });

export default defineConfig({
  schema: './src/database/dbSchemas.ts',
  out: './src/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  casing: 'snake_case',
  verbose: true,
  strict: true,
});
