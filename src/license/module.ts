import { Module } from '@nestjs/common';
import { LicenseController } from './controller/license.controller';
import { LicenseService } from './services/license.service';
import { LicenseRepository } from './repository/license.repository';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [LicenseController],
  providers: [LicenseService, LicenseRepository, PrismaClient],
  exports: [LicenseService],
})
export class LicenseModule {}
