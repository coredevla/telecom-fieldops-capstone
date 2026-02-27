import { createApp } from "./infra/app";
import { env } from "./config/env";
import { logger } from "./infra/logger/logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "API started");
});