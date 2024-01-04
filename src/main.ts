import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType, VERSION_NEUTRAL } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import * as bodyParser from 'body-parser';
import { NDILogger } from './logger/logger.service';
import { getNatsOptions } from './common/functions';
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
  const logger = new NDILogger(`${process.env.SERVICE_NAME}`).setContext('Main Logger');
  const app = await NestFactory.create(AppModule, {
    logger
  });
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('biometric');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: getNatsOptions()
  });
   app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    })
  );
  app.use(bodyParser.json({ limit: '5mb' }));

  const ENABLE_CORS_IP_LIST = configService.get('ENABLE_CORS_IP_LIST');
  if (ENABLE_CORS_IP_LIST && '' !== ENABLE_CORS_IP_LIST) {
    app.enableCors({
      origin: ENABLE_CORS_IP_LIST.split(','),
      methods: 'GET,HEAD,PUT,PATCH,POST',
      credentials: true
    });
  }
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'] // Global default version to show on Swagger
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Biometric Service')
    .setDescription('NDI Biometric Service Module')
    .setVersion('v1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/biometric/swagger', app, document);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1', VERSION_NEUTRAL] // Global default version
  });

  await app.startAllMicroservices();
  await app.listen(configService.get('PORT') || 3001, () => {
    logger.log(`Listening on Port:${configService.get('PORT')}` || '3001');
  });
}
bootstrap();
