import { Injectable } from '@nestjs/common';
import { LicenseRepository } from '../repository/license.repository';
import { LicenseLimit } from '../interface/license.interface';

@Injectable()
export class LicenseService {
  constructor(private readonly licenseRepository: LicenseRepository) {}

  async checkBalance(orgdid: string): Promise<boolean> {
    const licenseLimit = await this.licenseRepository.getLicenseLimit(orgdid);

    if (!licenseLimit || licenseLimit.usage === 0) {
      return true;
    }

    if (licenseLimit.usage > 0) {
      return licenseLimit.balance > licenseLimit.usage;
    }

    return false;
  }

  async logUsage(
    orgdid: string,
    liveliness_count = 0,
    match_count = 0,
    search_count = 0,
  ): Promise<void> {
    const session_count = Math.max(liveliness_count, match_count, search_count);

    await this.licenseRepository.createLicenseLog({
      orgdid,
      liveliness_count,
      match_count,
      search_count,
    });

    const licenseLimit = await this.licenseRepository.getLicenseLimit(orgdid);

    if (licenseLimit) {
      const newUsage = licenseLimit.usage + session_count;
      const newBalance = licenseLimit.balance - session_count;

      await this.licenseRepository.updateLicenseLimit(orgdid, {
        usage: newUsage,
        balance: newBalance,
      });

      if (newUsage >= licenseLimit.threshold) {
        this.sendEmailAlert(licenseLimit.orgadmin);
      }
    }
  }

  async renewSubscription(orgdid: string): Promise<LicenseLimit> {
    const licenseLimit = await this.licenseRepository.getLicenseLimit(orgdid);

    if (licenseLimit) {
      // This is a placeholder for the logic to mark all license_log entries as counted = true
      // and update the lastupdated timestamp.
    }

    return this.licenseRepository.updateLicenseLimit(orgdid, {
      reset_datetime: new Date(),
    });
  }

  private sendEmailAlert(orgadmin: string): void {
    // This is a placeholder for the email alert logic.
    console.log(`Sending email alert to ${orgadmin}`);
  }
}
