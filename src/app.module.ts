import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from '../config/config';
import { validationSchema } from '../config/validation';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import ExceptionHandler from './common/exception.handler';
import { PersonModule } from './person/module';
import { AuthModule } from './auth/auth.module';

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
    AuthModule
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionHandler
    }
  ]
})
export class AppModule {}
