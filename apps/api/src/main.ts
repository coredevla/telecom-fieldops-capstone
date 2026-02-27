import app from './infra/app';
import { env } from './config/env';
import { logger } from './infra/logger/logger';

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info({ correlationId: 'bootstrap', action: 'STARTUP', port: PORT }, 'API started');
});

export default app;
