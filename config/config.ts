export const config = () => ({
  NODE_ENV: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  // jwtSecret: process.env.JWT_SECRET,

  nats: {
    url: process.env.NATS_URL,
    NKEY_SEED: process.env.NKEY_SEED
  }
});
