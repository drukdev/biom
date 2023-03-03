import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import logger from '../lib/logger';
import * as bodyParser from 'body-parser';
import AllExceptionsFilter from './commons/exceptionsFilter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: configService.get("NATS_CLIENT")?.url,
    },
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(bodyParser.json({ limit: "5mb" }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Biometric Service")
    .setDescription("NDI Biometric Service Module")
    .setVersion("1.0")
    .build();

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("/swagger", app, document);
  await app.startAllMicroservices();
  await app.listen(configService.get("PORT") || 3000, () => {
    logger.info(`Listening on Port:` + configService.get("PORT") || 3000);
  });
}
bootstrap();
