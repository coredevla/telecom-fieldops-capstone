import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { correlationId } from '../middleware/correlationId';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler';
import { sanitizeResponseMiddleware } from '../middleware/sanitize';
import { buildApiRouter } from './routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: true }));
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
