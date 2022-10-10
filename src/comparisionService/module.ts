import { Module } from '@nestjs/common';
import { BiometricService } from './services/biometricService';
import { PersonController } from './controller/controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { ResponseModule, ResponseService } from 'src/response/src';

@Module({
  imports: [HttpModule, NestjsFormDataModule, ResponseModule],
  controllers: [PersonController],
  providers: [BiometricService, PrismaService, ResponseService],
})
export class PersonModule {}
