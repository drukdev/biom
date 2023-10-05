import * as Joi from 'joi';

export const validationSchema = Joi.object({

  // JWT_SECRET: Joi.string().required(),
  PORT: Joi.number().required(),
  NATS_URL: Joi.string().required(),
  NKEY_SEED: Joi.string().required(),
  STAGE_DIIT_SSO: Joi.string().required(),
  CLIENT_ID: Joi.string().required(),
  CLIENT_SECRET: Joi.string().required(),
  GRANT_TYPE: Joi.string().required(),
  CITIZEN_IMG: Joi.string().required(),
  IMMI_IMG: Joi.string().required(),
  THRESHOLD: Joi.string().required(),
  IMM_IMG_PP: Joi.string().required(),
  ELK_LOG_PATH: Joi.string().required(),
  BM_SDK_BASE_PATH: Joi.string().required(),
  AWS_DEFAULT_REGION: Joi.string().required(),
  COGNITO_USER_POOL_ID: Joi.string().required(),
  COGNITO_CLIENT_ID: Joi.string().required(),
  SERVICE_NAME: Joi.string().required(),
  ELK_LOG: Joi.string().required(),
  CONSOLE_LOG: Joi.string().required(),
  LOG_LEVEL: Joi.string().required(),
  ELK_USERNAME: Joi.string().required(),
  ELK_PASSWORD: Joi.string().required(),
  ROYAL_IMG: Joi.string().required()
});