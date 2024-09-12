import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PersonDTO } from '../dto/person';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';
import { CommonConstants } from '../../common/constants';
import { IdTypes } from '../../common/IdTypes';
import { Person } from '@regulaforensics/facesdk-webclient';
import { NDILogger } from '../../logger/logger.service';
import { LoggerClsStore } from '../../logger/logger.store';
import { AsyncLocalStorage } from 'async_hooks';
import { BiometricReq } from '../interface/person.interface';
import AuthTokenService from '../../auth-token/auth-token';
import { RegulaPersonDetails } from '../dto/regulaPersonDetails.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const md5 = require('md5');

@Injectable()
export class SystemRepository {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private readonly als: AsyncLocalStorage<LoggerClsStore>,
    private readonly ndiLogger: NDILogger,
    private readonly authTokenService: AuthTokenService
  ) {}

  async getCitizenImg(biometricReq: BiometricReq): Promise<string | undefined> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    try {
      if (null != biometricReq.idNumber) {

        const accessToken = await this.authTokenService.getAuthToken();

        if (null != accessToken || accessToken != undefined) {
          ndiLogger.log(`before calling callSystemToGetPerson`);
          let fetchedPerson: PersonDTO | Person;
          try {
            fetchedPerson = await this.callSystemToGetPerson(
              accessToken,
              biometricReq.idNumber,
              biometricReq.idType
            );
          } catch (error) {
            ndiLogger.error(error);
            fetchedPerson = undefined;
          }

          if (
            undefined == fetchedPerson ||
            undefined == fetchedPerson['image'] ||
            null == fetchedPerson['image'] ||
            '' == fetchedPerson['image']
          ) {
            throw new HttpException(
              {
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Image record not found. Please update your record'
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
      throw err;
    }
  }

  async callSystemToGetPerson(token: string, idNumber: string, idType: IdTypes): Promise<PersonDTO | Person> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    ndiLogger.log(`====================started calling system for idType : ${idType}`);
    let systemUrl: string;

    switch (idType.toLowerCase()) {
       // Get Image by Citizenship
       case IdTypes.Citizenship.toLowerCase():
        systemUrl = `${this.configService.get('NDI_CITIZEN_IMG')}${idNumber}`;
        ndiLogger.log(`Started to get citizen image using NDI_CITIZEN_IMG API`);
        break;
      case IdTypes.WorkPermit.toLowerCase():
        systemUrl = `${this.configService.get('IMMI_IMG')}${idNumber}`;
        ndiLogger.log(`Started to get immigrant image using IMMI_IMG API`);
        break;
      // Get Image by Passport number
      case IdTypes.Passport.toLowerCase():
        systemUrl = `${this.configService.get('IMM_IMG_PP')}${idNumber}`;
        ndiLogger.log(`Started to get immigrant image using IMM_IMG_PP API`);
        break;
      default:
        throw new HttpException('IdType is invalid', HttpStatus.BAD_REQUEST);
    }

    try {
      const response: Person | PersonDTO = await this.getUserImage(token, systemUrl, idType);
      return response;
    } catch (error) {
      ndiLogger.error(`ERROR in rest request : ${JSON.stringify(error)}`);

      if (IdTypes.Citizenship.toLocaleLowerCase() === idType.toLocaleLowerCase()) {
        try {
          ndiLogger.log(`Started to get citizen image using CITIZEN_IMG API`);
          systemUrl = `${this.configService.get('CITIZEN_IMG')}${idNumber}`;
          return this.getUserImage(token, systemUrl, idType);
        } catch (error) {
          try {
            ndiLogger.log('Getting royal user data');
            systemUrl = `${this.configService.get('ROYAL_IMG')}${idNumber}`;
            const response: Person | PersonDTO = await this.getUserImage(token, systemUrl, idType);
            return response;
          } catch (err) {
            ndiLogger.error(`ERROR in getting royal user image : ${JSON.stringify(error.stack ? error.stack : error)}`);
            this.checkError(err);
          }
        }
      }

      this.checkError(error);
    }
  }
  checkError(error): void {
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

  async getUserImage(token: string, systemUrl: string, idType: IdTypes): Promise<Person | PersonDTO> {
    return lastValueFrom(
      this.httpService
        .get(systemUrl, { headers: { Authorization: `${token}` } })
        .pipe(map((response) => response.data))
    ).then((data: Person) => this.getData(data, idType));
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  getData(data: any, system: string): Person | PersonDTO {
    let result: Person | PersonDTO;

    if (system.match(IdTypes.Citizenship)) {
      if (data['ndicitizenimages']) {
        if (
          0 < Object.keys(data['ndicitizenimages']).length &&
          data['ndicitizenimages']['ndicitizenimage'] &&
          data['ndicitizenimages']['ndicitizenimage'][0]
        ) {
          // eslint-disable-next-line prefer-destructuring
          result = data['ndicitizenimages']['ndicitizenimage'][0];
        } else {
          throw new HttpException('NDI citizen image not found', HttpStatus.BAD_REQUEST);
        }
      } else if (data['citizenimages']) {
        result = 0 < Object.keys(data['citizenimages']).length ? data['citizenimages']['citizenimage'][0] : undefined;
      }
    }
    if (system.match(IdTypes.WorkPermit)) {
      result = 0 < Object.keys(data['ImmiImages']).length ? data['ImmiImages']['ImmiImage'][0] : undefined;
    }
    if (system.match(IdTypes.Passport)) {
      result = 0 < Object.keys(data['ImmisImages']).length ? data['ImmisImages']['ImmisImage'][0] : undefined;
    }
    return result;
  }


  async getPersonIDFromRegula(idNumber:string): Promise<RegulaPersonDetails> {
    const accessToken = await this.authTokenService.getAuthToken();
    const url = `${this.configService.get('REGULA_DATABASE_SERVICE')}${md5(`${idNumber}`)}`;
    return lastValueFrom(
      this.httpService
        .get(url, { headers: { Authorization: `${accessToken}` } })
        .pipe(map((response) => response.data))); 
  }
}
