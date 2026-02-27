import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from '../config/env';
import { correlationId } from '../middleware/correlationId';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import { sanitizeResponseMiddleware } from '../middleware/sanitize';
import { buildApiRouter } from './routes';

export function createApp() {
  const app = express();
  const allowedOrigins = [
    env.FRONTEND_URL,
    env.API_PUBLIC_URL,
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean);

  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          callback(null, true);
          return;
        }

        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }

        callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id'],
      credentials: true,
    }),
  );
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(correlationId());
  app.use(sanitizeResponseMiddleware);

  app.use('/api/v1', buildApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler());

  return app;
}

const app = createApp();

export default app;
