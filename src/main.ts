import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as bodyParser from 'body-parser';
import { nkeyAuthenticator } from 'nats';
import { NDILogger } from './logger/logger.service';

async function bootstrap(): Promise<void> {
  const logger = new NDILogger(`${process.env.SERVICE_NAME}`).setContext('Main Logger');
  const app = await NestFactory.create(AppModule, {
    logger
  });
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('biometric');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: configService.get('NATS_URL'),
      authenticator: nkeyAuthenticator(new TextEncoder().encode(
        configService.get('NKEY_SEED')
      ))
    }
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(bodyParser.json({ limit: '5mb' }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Biometric Service Test CICD')
    .setDescription('NDI Biometric Service Module')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/biometric/swagger', app, document);
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT') || 3001, () => {
    logger.log(`Listening on Port:${configService.get('PORT')}` || '3001');
  });
}
bootstrap();
