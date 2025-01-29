import dotenv from 'dotenv';
import { cleanEnv, port, str } from 'envalid';

const envPath = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env';
dotenv.config({ path: envPath });

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ['development', 'production', 'test'],
    default: 'development',
  }),
  PORT: port({
    default: 8000,
  }),
  CORS_ORIGIN: str(),
  DATABASE_URL: str(),
});
