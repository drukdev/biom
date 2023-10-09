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

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
    private http: HttpHealthIndicator,
    private readonly configService: ConfigService
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
        })
    ]);
  }
}
