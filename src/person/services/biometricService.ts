import { Injectable } from '@nestjs/common';
import { PersonDTO } from '../dto/person';
import { ConfigService } from '@nestjs/config';

import * as fs from 'fs';

import { AsyncLocalStorage } from 'async_hooks';

import { BiometricRepository } from '../repository/biometricsRepository';
import { SystemRepository } from '../repository/systemRepository';
import { CommonConstants } from '../../common/constants';
import { NDILogger } from '../../logger/logger.service';
import { LoggerClsStore } from '../../logger/logger.store';
import { ResponseType } from '../../common/response.interface';
@Injectable()
export class BiometricService {
  constructor(
    private readonly configService: ConfigService,
    private readonly biometricRepo: BiometricRepository,
    private readonly systemRepository: SystemRepository,
    private readonly als: AsyncLocalStorage<LoggerClsStore>,
    private readonly ndiLogger: NDILogger
  ) {}
  public async compareImage(image: Buffer, person: PersonDTO): Promise<ResponseType> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    ndiLogger.log('Start to compare images');
    let personImg: ArrayBufferLike;
    const returnResult = {} as ResponseType;
    try {
      const PATH_TO_TEMP = `/src/person/services/temporaryUpload/`;
      switch (person.idNumber) {
        case '0190':
        case '0191':
          personImg = this.getPersonImgBuffer(`${process.env.PWD}${PATH_TO_TEMP}akshay.jpeg`);
          break;
        case '0194':
        case '0195':
          personImg = this.getPersonImgBuffer(`${process.env.PWD}${PATH_TO_TEMP}makrand.jpeg`);
          break;
        case '0192':
        case '0193':
          personImg = this.getPersonImgBuffer(`${process.env.PWD}${PATH_TO_TEMP}vivek.jpeg`);
          break;
        case 'E4089670':
          personImg = this.getPersonImgBuffer(`${process.env.PWD}${PATH_TO_TEMP}jacques.png`);
          break;
        case '0197':
        case '0198':
          personImg = this.getPersonImgBuffer(`${process.env.PWD}${PATH_TO_TEMP}Sai.jpeg`);
          break;
        case '0199':
        case '0202':
          personImg = this.getPersonImgBuffer(`${process.env.PWD}${PATH_TO_TEMP}ankita.jpg`);
          break;
        case '0203':
        case '0206':
          personImg = this.getPersonImgBuffer(`${process.env.PWD}${PATH_TO_TEMP}rakesh.jpeg`);
          break;
        case '0201':
        case '0204':
          personImg = this.getPersonImgBuffer(`${process.env.PWD}${PATH_TO_TEMP}ashwini.jpeg`);
          break;
        default:
          personImg = await this.systemRepository
            .getCitizenImg(person)
            .then((value: string) => Buffer.from(value, 'base64'));
      }
      // Start comparing image buffers
      const compatibility: number =
        (await this.biometricRepo.compareImage(image, personImg).then((value) => {
          if (value != undefined) {
            return value[2];
          }
        })) || undefined;

      if (compatibility == undefined || null == compatibility) {
        returnResult.statusCode = CommonConstants.RESP_BAD_REQUEST;
        returnResult.error = 'Invalid Biometric';
      } else {
        const result: boolean = compatibility > this.configService.get('THRESHOLD');
        ndiLogger.debug(`result of comparision : ${JSON.stringify(result)}`);
        returnResult.statusCode = CommonConstants.RESP_SUCCESS_200;
        returnResult.message = 'success';
        if (!result) {
          returnResult.statusCode = CommonConstants.RESP_BAD_REQUEST;
          returnResult.error = 'Invalid Biometric';
        }
        returnResult.data = { compatibility };
      }
    } catch (error) {
      ndiLogger.error(`error in biometric : ${error}`);
      returnResult.statusCode = CommonConstants.RESP_ERR_500;
      returnResult.error = CommonConstants.SERVER_ERROR;
    }
    return returnResult;
  }

  getPersonImgBuffer(path: string | Buffer | URL): ArrayBufferLike {
    return fs.readFileSync(path).buffer;
  }
}
