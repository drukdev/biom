import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.health';
import { PrismaClient } from '@prisma/client';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { LicenseHealthIndicator } from './license.health';
import { LicenseService } from '../license/services/license.service';
import { LicenseRepository } from '../license/repository/license.repository';

@Module({
  imports: [TerminusModule, HttpModule, ConfigModule],
  controllers: [HealthController],
  providers: [
    PrismaHealthIndicator,
    PrismaClient,
    LicenseHealthIndicator,
    LicenseService,
    LicenseRepository,
  ],
})
export class HealthModule {}
