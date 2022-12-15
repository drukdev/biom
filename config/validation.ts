import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid(
    'development',
    'production',
    'test',
    'provision',
  ),
  // JWT_SECRET: Joi.string().required(),
  PORT: Joi.number().required(),
});
