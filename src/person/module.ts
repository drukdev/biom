import { Module } from '@nestjs/common';
import { BiometricService } from './services/biometricService';
import { PersonController } from './controller/controller';
import { HttpModule } from '@nestjs/axios';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import NATSClientService from 'src/common/NATSClientService';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.cwd()}/.env` }),
    ClientsModule.register([
      {
        name: 'NATS_CLIENT',
        transport: Transport.NATS,
        options: {
          servers: [`${process.env.NATS_URL}`]
          // deserializer: new InboundMessageIdentityDeserializer(),
          // serializer: new OutboundResponseIdentitySerializer(),
        }
      }
    ]),
    HttpModule,
    NestjsFormDataModule
  ],
  controllers: [PersonController],
  providers: [BiometricService, NATSClientService]
})
export class PersonModule {}
