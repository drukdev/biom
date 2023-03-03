import { Module } from '@nestjs/common';
import { BiometricService } from './services/biometricService';
import { PersonController } from './controller/controller';
import { HttpModule } from '@nestjs/axios';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ResponseModule, ResponseService } from 'src/response/src';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import NATSClientService from 'src/commons/NATSClientService';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: `${process.cwd()}/config/env/${process.env.NODE_ENV}.env`}),
    ClientsModule.register([
      {
        name: 'NATS_CLIENT',
        transport: Transport.NATS,
        options: {
          servers: [`${process.env.NATS_URL}` as string]
          // deserializer: new InboundMessageIdentityDeserializer(),
          // serializer: new OutboundResponseIdentitySerializer(),
        },
      },
    ]),
    HttpModule, NestjsFormDataModule, ResponseModule
  ],
  controllers: [PersonController],
  providers: [BiometricService, ResponseService, NATSClientService],
})
export class PersonModule {}
