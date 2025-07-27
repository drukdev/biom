import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { LicenseService } from '../license/services/license.service';

@Injectable()
export class LicenseHealthIndicator extends HealthIndicator {
  constructor(private readonly licenseService: LicenseService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // A simple check to see if the license service is responsive.
      // This could be a call to a lightweight function in the license service.
      await this.licenseService.checkBalance('healthcheck');
      return this.getStatus(key, true);
    } catch (e) {
      throw new HealthCheckError('License service check failed', e);
    }
  }
}
