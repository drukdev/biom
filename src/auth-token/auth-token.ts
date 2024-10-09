import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NDILogger } from '../logger/logger.service';
import { LoggerClsStore } from '../logger/logger.store';
import { AsyncLocalStorage } from 'async_hooks';
import { plainToInstance } from 'class-transformer';
import qs = require('qs');
import { lastValueFrom, map } from 'rxjs';
import { CommonConstants, HeaderConstants } from '../common/constants';
import { AuthTokenRequest } from './auth-token-req.dto';
import { AuthTokenResponse } from './auth-token-res.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import AsyncRetry = require('async-retry');
import { retryOptions } from '../common/response.interface';

@Injectable()
export default class AuthTokenService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private readonly als: AsyncLocalStorage<LoggerClsStore>,
    private readonly ndiLogger: NDILogger
  ) {}

  retryOptions(): retryOptions {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);

    return {
      retries: 3,
      factor: 2,
      minTimeout: 2000,
      onRetry(e: { message: string }, attempt: number): void {
        ndiLogger.error(`Error:: ${e.message}`);
        ndiLogger.log(`Attempt:: ${attempt}`);
      }
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getAuthToken(): Promise<any> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    try {
      const authToken: string | undefined = await this.cacheService.get(CommonConstants.DCRC_ACCESS_TOKEN_KEY);

      if (authToken) {
        ndiLogger.log('Access token: found');
        return `${authToken}`;
      }

      const ssoUrl: string = this.configService.get('STAGE_DIIT_SSO') || '';
      const payload = new AuthTokenRequest();
      // eslint-disable-next-line camelcase
      payload.client_id = this.configService.get('CLIENT_ID') || '';
      // eslint-disable-next-line camelcase
      payload.client_secret = this.configService.get('CLIENT_SECRET') || '';
      // eslint-disable-next-line camelcase
      payload.grant_type = this.configService.get('GRANT_TYPE');

      const config = {
        headers: {
          'Content-Type': HeaderConstants.HEADER_TYPE
        }
      };
      ndiLogger.log(`Started to get auth token from GDC`);

      const getAuthTokenRetry = async (): Promise<AuthTokenResponse> => lastValueFrom(
          this.httpService.post(ssoUrl, qs.stringify(payload), config).pipe(map((response) => response.data))
        ).then((data: AuthTokenResponse) => plainToInstance(AuthTokenResponse, data));

      const tokenResponse: AuthTokenResponse = await AsyncRetry(getAuthTokenRetry, this.retryOptions());

       await this.cacheService.set(
        CommonConstants.DCRC_ACCESS_TOKEN_KEY,
        `Bearer ${tokenResponse.accessToken}`,
        (tokenResponse.expiresIn * CommonConstants.millisecondToSecond) - CommonConstants.minusTokenExpiryTimeInSeconds
      );
        ndiLogger.log(`Token stored in cache`);
      return `Bearer ${tokenResponse.accessToken}`;
    } catch (error) {
      ndiLogger.log(`Error while getting auth token from GDC`);
    }
  }
}