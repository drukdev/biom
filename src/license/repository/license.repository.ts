import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LicenseLimit, LicenseLog } from '../interface/license.interface';

@Injectable()
export class LicenseRepository {
  constructor(private prisma: PrismaClient) {}

  async createLicenseLimit(data: LicenseLimit): Promise<LicenseLimit> {
    return this.prisma.license_limit.create({ data });
  }

  async getLicenseLimit(orgdid: string): Promise<LicenseLimit | null> {
    return this.prisma.license_limit.findUnique({ where: { orgdid } });
  }

  async updateLicenseLimit(orgdid: string, data: Partial<LicenseLimit>): Promise<LicenseLimit> {
    return this.prisma.license_limit.update({ where: { orgdid }, data });
  }

  async deleteLicenseLimit(orgdid: string): Promise<LicenseLimit> {
    return this.prisma.license_limit.delete({ where: { orgdid } });
  }

  async createLicenseLog(data: Omit<LicenseLog, 'id' | 'lastupdated' | 'counted' | 'transaction_datetime'>): Promise<LicenseLog> {
    return this.prisma.license_log.create({
      data: {
        ...data,
        transaction_datetime: new Date(),
      },
    });
  }
}
