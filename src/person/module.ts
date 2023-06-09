import { Module } from '@nestjs/common';
import { BiometricService } from './services/biometricService';
import { PersonController } from './controller/controller';
import { HttpModule } from '@nestjs/axios';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import NATSClientService from '../common/NATSClientService';
import { nkeyAuthenticator } from 'nats';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.cwd()}/.env` }),
    ClientsModule.register([
      {
        name: 'NATS_CLIENT',
        transport: Transport.NATS,
        options: {
          servers: [`${process.env.NATS_URL}` as string],
          authenticator: nkeyAuthenticator(new TextEncoder().encode(process.env.NKEY_SEED))
        }
      },
    ]),
    HttpModule,
    NestjsFormDataModule
  ],
  controllers: [PersonController],
  providers: [BiometricService, NATSClientService]
})
export class PersonModule {}
