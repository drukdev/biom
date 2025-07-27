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

  async createLicenseLog(data: Omit<LicenseLog, 'id' | 'lastupdated' | 'counted' | 'transaction_datetime' | 'response_from_server'> & { response_from_server?: string }): Promise<LicenseLog> {
    return this.prisma.license_log.create({
      data: {
        ...data,
        transaction_datetime: new Date(),
      },
    });
  }

  async markLicenseLogsAsCounted(orgdid: string, reset_datetime: Date): Promise<void> {
    await this.prisma.license_log.updateMany({
      where: {
        orgdid,
        transaction_datetime: {
          lt: reset_datetime,
        },
      },
      data: {
        counted: true,
      },
    });
  }
}
