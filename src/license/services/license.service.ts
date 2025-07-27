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
    response_from_server?: string,
  ): Promise<void> {
    const session_count = Math.max(liveliness_count, match_count, search_count);

    await this.licenseRepository.createLicenseLog({
      orgdid,
      liveliness_count,
      match_count,
      search_count,
      response_from_server,
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

  async renewSubscription(orgdid: string, renew_subscription = false): Promise<LicenseLimit> {
    const licenseLimit = await this.licenseRepository.getLicenseLimit(orgdid);

    if (licenseLimit && renew_subscription) {
      await this.licenseRepository.markLicenseLogsAsCounted(orgdid, licenseLimit.reset_datetime);
    }

    return this.licenseRepository.updateLicenseLimit(orgdid, {
      reset_datetime: new Date(),
    });
  }

  private sendEmailAlert(orgadmin: string): void {
    // This is a placeholder for the email alert logic.
    // In a real application, this would use a service like Nodemailer to send an email.
    console.log(`Sending email alert to ${orgadmin}`);
  }
}
