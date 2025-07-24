import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { getNatsOptions } from './../common/functions';
import { AlsModule } from '../AsyncLocalStorage/als.module';
import NATSClientService from '../common/NATSClientService';
import { LoggerModule } from '../logger/logger.module';
import { PersonController } from './controller/controller';
import { BiometricRepository } from './repository/biometricsRepository';
import { SystemRepository } from './repository/systemRepository';
import { BiometricService } from './services/biometricService';
import { S3Service } from '../aws-s3/s3.service';
import { DCRCAuthModule } from '../auth-token/DCRCAuthModule';
import { LicenseModule } from '../license/module';
import { LicenseService } from '../license/services/license.service';
import { LicenseRepository } from '../license/repository/license.repository';
import { PrismaClient } from '@prisma/client';


@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: `${process.cwd()}/.env` }),
    ClientsModule.register([
      {
        name: 'NATS_CLIENT',
        transport: Transport.NATS,
        options: getNatsOptions()
      }
    ]),
    HttpModule,
    NestjsFormDataModule,
    AlsModule,
    LoggerModule,
    DCRCAuthModule,
    LicenseModule
  ],
  controllers: [PersonController],
  providers: [BiometricService, NATSClientService, BiometricRepository, SystemRepository, S3Service, LicenseService, LicenseRepository, PrismaClient]
})
export class PersonModule {}
