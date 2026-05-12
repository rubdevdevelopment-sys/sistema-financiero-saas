import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

app.listen(env.PORT, () => {
  logger.info(`${env.APP_NAME} API escuchando en puerto ${env.PORT}`);
});
