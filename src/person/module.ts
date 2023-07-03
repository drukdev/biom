import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { nkeyAuthenticator } from 'nats';
import { AlsModule } from '../AsyncLocalStorage/als.module';
import NATSClientService from '../common/NATSClientService';
import { LoggerModule } from '../logger/logger.module';
import { PersonController } from './controller/controller';
import { BiometricRepository } from './repository/biometricsRepository';
import { SystemRepository } from './repository/systemRepository';
import { BiometricService } from './services/biometricService';


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
      }
    ]),
    HttpModule,
    NestjsFormDataModule,
    AlsModule,
    LoggerModule
  ],
  controllers: [PersonController],
  providers: [BiometricService, NATSClientService, BiometricRepository, SystemRepository]
})
export class PersonModule {}
