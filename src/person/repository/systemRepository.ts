import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as qs from 'qs';
import { PersonDTO } from '../dto/person';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { AuthTokenResponse } from '../dto/auth-token-res.dto';
import { CommonConstants } from '../../common/constants';
import { IdTypes } from '../../common/IdTypes';
import { AuthTokenRequest } from '../dto/auth-token-req.dto';
import { plainToInstance } from 'class-transformer';
import { Person } from '@regulaforensics/facesdk-webclient';
import { NDILogger } from '../../logger/logger.service';
import { LoggerClsStore } from '../../logger/logger.store';
import { AsyncLocalStorage } from 'async_hooks';
import { BiometricReq } from '../interface/person.interface';

@Injectable()
export class SystemRepository {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private readonly als: AsyncLocalStorage<LoggerClsStore>,
    private readonly ndiLogger: NDILogger
  ) {}

  async getCitizenImg(biometricReq: BiometricReq): Promise<string | undefined> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    ndiLogger.log(`start to get Citizen Image`);
    try {
      if (null != biometricReq.idNumber) {
        // Get access token
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
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        };
        ndiLogger.error(`sso_url : ${ssoUrl}`);
        const tokenResponse: AuthTokenResponse = await lastValueFrom(
          this.httpService.post(ssoUrl, qs.stringify(payload), config).pipe(map((response) => response.data))
        ).then((data: AuthTokenResponse) => plainToInstance(AuthTokenResponse, data));

        if (null != tokenResponse || tokenResponse != undefined) {
          const fetchedPerson: PersonDTO | Person = await this.callSystemToGetPerson(
            tokenResponse.accessToken,
            biometricReq.idNumber,
            biometricReq.idType
          );
          if (fetchedPerson == undefined || fetchedPerson['image'] == undefined || null == fetchedPerson['image']) {
            throw new HttpException(
              {
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Citizen data not found. Please update your record'
              },
              HttpStatus.NOT_FOUND
            );
          } else {
            return fetchedPerson['image'];
          }
        }
      }
    } catch (err) {
      ndiLogger.error(err);
    }
  }

  async callSystemToGetPerson(token: string, idNumber: string, idType: IdTypes): Promise<PersonDTO | Person> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    ndiLogger.log(`started calling system for idType : ${idType}`);
    let systemurl: string = this.configService.get('CITIZEN_IMG') || '';
    // Get Image by Work Permit
    if (idType.toLowerCase().match(IdTypes.WorkPermit.toLowerCase())) {
      systemurl = this.configService.get('IMMI_IMG') || '';
    }
    // Get Image by Passport number
    if (idType.toLowerCase().match(IdTypes.Passport.toLowerCase())) {
      systemurl = this.configService.get('IMM_IMG_PP') || '';
    }
    systemurl = `${systemurl}${idNumber}`;
    ndiLogger.log(`started calling system : url : ${systemurl}`);
    try {
      const response: Person | PersonDTO = await lastValueFrom(
        this.httpService
          .get(systemurl, { headers: { Authorization: `Bearer ${token}` } })
          .pipe(map((response) => response.data))
      ).then((data: Person) => this.getData(data, idType));
      return response;
    } catch (error) {
      ndiLogger.error(`ERROR in POST : ${JSON.stringify(error)}`);
      if (error.toString().includes(CommonConstants.RESP_ERR_HTTP_INVALID_HEADER_VALUE)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            error: CommonConstants.UNAUTH_MSG
          },
          HttpStatus.UNAUTHORIZED
        );
      }
      if (error.toString().includes(CommonConstants.RESP_ERR_NOT_FOUND)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            error: error.message
          },
          HttpStatus.NOT_FOUND
        );
      }
      if (error.toString().includes(CommonConstants.RESP_BAD_REQUEST)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            error: error.message
          },
          HttpStatus.BAD_REQUEST
        );
      }
      if (error.toString().includes(CommonConstants.RESP_ERR_UNPROCESSABLE_ENTITY)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            error: error.message
          },
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      } else {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Something went wrong.'
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  getData(data: any, system: string): Person | PersonDTO {
    let result: Person | PersonDTO =
      0 < Object.keys(data['citizenimages']).length ? data['citizenimages']['citizenimage'][0] : undefined;
    if (system.match(IdTypes.WorkPermit)) {
      result = 0 < Object.keys(data['ImmiImages']).length ? data['ImmiImages']['ImmiImage'][0] : undefined;
    }
    if (system.match(IdTypes.Passport)) {
      result = 0 < Object.keys(data['ImmisImages']).length ? data['ImmisImages']['ImmisImage'][0] : undefined;
    }
    return result;
  }
}
