import { APP_FILTER } from '@nestjs/core';
import { HttpException, HttpStatus, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { AsyncLocalStorage } from 'async_hooks';
import { AlsModule } from './AsyncLocalStorage/als.module';
import { LoggerModule } from './logger/logger.module';
import { validationSchema } from '../config/validation';
import { config } from '../config/config';
import { AuthModule } from './auth/auth.module';
import { HealthController } from './health/health.controller';
import { NDILogger } from './logger/logger.service';
import { LoggerClsStore } from './logger/logger.store';
import { PersonModule } from './person/module';
import ExceptionHandler from './common/exception.handler';
import { S3Module } from './aws-s3/s3.module';
import { allowedHTTPMethods } from './common/constants';

@Module({
  imports: [
    TerminusModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      envFilePath: `${process.cwd()}/.env`,
      validationSchema
    }),
    PersonModule,
    AuthModule,
    AlsModule,
    LoggerModule,
    S3Module
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionHandler
    }
  ]
})
export class AppModule {
  constructor(
    // inject the AsyncLocalStorage in the module constructor,
    private readonly als: AsyncLocalStorage<LoggerClsStore>,
    private configService: ConfigService
  ) {}
  configure(consumer: MiddlewareConsumer): void {
    // bind the middleware,
    consumer
      .apply((req, res, next) => {

        if (!allowedHTTPMethods.includes(req.method)) {
          throw new HttpException('Method Not Allowed', HttpStatus.METHOD_NOT_ALLOWED); // Return 405 Method Not Allowed for disallowed methods
        }
        // populate the store with some default values
        // based on the request,
        const store = {
          ndiLogger: new NDILogger(this.configService.get('SERVICE_NAME') || '').setContext(
            `${req.method}-${req.baseUrl}`
          )
        };
        // and pass the "next" function as callback
        // to the "als.run" method together with the store.
        this.als.run(store, () => next());
      })
      // and register it for all routes (in case of Fastify use '(.*)')
      .forRoutes('*');
  }
}
