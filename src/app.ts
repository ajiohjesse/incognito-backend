import { globalLimiter } from '@/middleware/rateLimitMiddleware';
import { healthRoute } from '@/routes/healthRoute';
import { env } from '@/utils/env';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorMiddleware } from './middleware/errorMiddleware';
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
app.use(healthRoute);
app.use(globalLimiter);

app.use('/user', userRoute);

app.use(errorMiddleware);

export { app };
