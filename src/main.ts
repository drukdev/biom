import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import logger from '../lib/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.NATS,
    options: {
      url: configService.get('nats')?.url,
      // deserializer: new InboundMessageIdentityDeserializer(),
      // serializer: new OutboundResponseIdentitySerializer(),
    },
  });

  app.enableVersioning({
    defaultVersion: ['1', '2'],
    type: VersioningType.URI,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NDI Foundational Issuer APIs')
    .setDescription('NDI Foundational Issuer Module')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('/swagger', app, document);
  await app.startAllMicroservices();
  await app.listen(configService.get('PORT') || 3000, () => {
    logger.info(`Listening on Port:`+configService.get('PORT') || 3000 );
    //console.log('Serving running on port', );
  });
}
bootstrap();
