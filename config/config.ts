export const config = () => ({
  NODE_ENV: process.env.NODE_ENV,
  port: Number(process.env.PORT),
  // jwtSecret: process.env.JWT_SECRET,

  nats: {
    url: process.env.NATS_URL,
  },

  database: {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    DATABASE_URL: process.env.DATABASE_URL,
    synchronize: false,
    logging: false,
    entities: [__dirname + '/../**/**.model{.ts,.js}'],
  },
});
