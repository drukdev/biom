import { Module } from '@nestjs/common';
import AuthTokenService from './auth-token';
import { CacheModule } from '../cache/cache.module';
import { AlsModule } from 'src/AsyncLocalStorage/als.module';
import { LoggerModule } from 'src/logger/logger.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        CacheModule,
        AlsModule,
        LoggerModule,
        HttpModule
    ],
    providers: [AuthTokenService],
    exports: [AuthTokenService]
})
export class DCRCAuthModule { }