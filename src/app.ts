import { globalLimiter } from '@/middleware/rateLimitMiddleware';
import { healthRoute } from '@/routes/healthRoute';
import { env } from '@/utils/env';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorMiddleware } from './middleware/errorMiddleware';
import { messageRoute } from './routes/messageRoute';
import { userRoute } from './routes/userRoute';

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(morgan(env.isProduction ? 'combined' : 'dev'));
app.get('/health-check', healthRoute);
app.use(globalLimiter);

app.use('/users', userRoute);
app.use('/conversations', messageRoute);

app.use(errorMiddleware);

export { app };
