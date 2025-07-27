import { Controller, Get } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import {
  HealthCheckService,
  MicroserviceHealthIndicator,
  HealthCheck,
  HttpHealthIndicator,
  HealthCheckResult,
  HealthIndicatorResult
} from '@nestjs/terminus';
import { nkeyAuthenticator } from 'nats';
import { ConfigService } from '@nestjs/config';
import { PrismaHealthIndicator } from './prisma.health';
import { LicenseHealthIndicator } from './license.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
    private http: HttpHealthIndicator,
    private readonly configService: ConfigService,
    private prismaHealth: PrismaHealthIndicator,
    private licenseHealth: LicenseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  getHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => this.microservice.pingCheck('NATS-server', {
          transport: Transport.NATS,
          options: {
            servers: `${process.env.NATS_URL}`.split(','),
            authenticator: nkeyAuthenticator(new TextEncoder().encode(
              this.configService.get('NKEY_SEED')
            ))
          }
        }),
      async (): Promise<HealthIndicatorResult> => this.prismaHealth.isHealthy('prisma'),
      async (): Promise<HealthIndicatorResult> => this.licenseHealth.isHealthy('license'),
    ]);
  }
}
