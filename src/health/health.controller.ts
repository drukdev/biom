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

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private microservice: MicroserviceHealthIndicator,
    private http: HttpHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  getHealth(): Promise<HealthCheckResult> {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => this.microservice.pingCheck('NATS-server', {
          transport: Transport.NATS,
          options: {
            servers: [`${process.env.NATS_URL}`]
          }
        })
      //async () => this.http.pingCheck('agent-service', 'http://localhost:3002/swagger'),
      //async () => this.http.pingCheck('Biometric-service', 'http://localhost:3000/swagger'),
    ]);
  }
}
