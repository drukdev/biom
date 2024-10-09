export const config = () => ({
  NODE_ENV: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  SERVICE_NAME: process.env.SERVICE_NAME,
  CONSOLE_LOG: process.env.CONSOLE_LOG,
  ELK_LOG: process.env.ELK_LOG,
  LOG_LEVEL: process.env.LOG_LEVEL,
  ELK_USERNAME:process.env.ELK_USERNAME,
  ELK_PASSWORD:process.env.ELK_PASSWORD,
  CACHE_DEFAULT_EXPIRY: process.env.CACHE_DEFAULT_EXPIRY,
  CACHE_MAX_LIMIT: process.env.CACHE_MAX_LIMIT,
  REGULA_DATABASE_SERVICE: process.env.REGULA_DATABASE_SERVICE,
  nats: {
    url: process.env.NATS_URL,
    NKEY_SEED: process.env.NKEY_SEED
  },
  ENABLE_CORS_IP_LIST: process.env.ENABLE_CORS_IP_LIST
});
