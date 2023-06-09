import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { MyLogger } from 'lib/logger';
import * as bodyParser from 'body-parser';
import AllExceptionsFilter from './common/exceptionsFilter';
import { nkeyAuthenticator } from 'nats';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Main Logger');
  const app = await NestFactory.create(AppModule, {
    logger: new MyLogger()
  });
  const configService = app.get(ConfigService);
app.setGlobalPrefix('biometric')
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      servers: configService.get('nats').url,
      authenticator: nkeyAuthenticator(new TextEncoder().encode(configService.get('nats').NKEY_SEED))
    }
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(bodyParser.json({ limit: '5mb' }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Biometric Service')
    .setDescription('NDI Biometric Service Module')
    .setVersion('1.0')
    .build();

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("/biometric/swagger", app, document);
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT') || 3000, () => {
    logger.log(`Listening on Port:${configService.get('PORT')}` || 3000);
  });
}
bootstrap();
