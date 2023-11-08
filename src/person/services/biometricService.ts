import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AsyncLocalStorage } from 'async_hooks';

import { BiometricRepository } from '../repository/biometricsRepository';
import { SystemRepository } from '../repository/systemRepository';
import { AWS_S3_DIRECTORY, CommonConstants } from '../../common/constants';
import { NDILogger } from '../../logger/logger.service';
import { LoggerClsStore } from '../../logger/logger.store';
import { ResponseType } from '../../common/response.interface';
import { BiometricReq } from '../interface/person.interface';
import { S3Service } from '../../aws-s3/s3.service';
import { IdTypes } from 'src/common/IdTypes';
@Injectable()
export class BiometricService {
  constructor(
    private readonly configService: ConfigService,
    private readonly biometricRepo: BiometricRepository,
    private readonly systemRepository: SystemRepository,
    private readonly als: AsyncLocalStorage<LoggerClsStore>,
    private readonly ndiLogger: NDILogger,
    private readonly s3Service: S3Service
  ) {}
  public async compareImage(image: Buffer, biometricReq: BiometricReq): Promise<ResponseType> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    ndiLogger.log('Start to compare images');
    let personImg: ArrayBufferLike;
    const returnResult = {} as ResponseType;

    try {
      ndiLogger.log('Getting Test user image');
      const bucketName = this.configService.get('USERS_TEST_DATA_BUCKET');
      let directory: string;
      switch (biometricReq.idType) {
        case IdTypes.Citizenship:
          directory = `${AWS_S3_DIRECTORY.Image}/${AWS_S3_DIRECTORY.Citizenship}`;
          break;
        case IdTypes.WorkPermit:
          directory = `${AWS_S3_DIRECTORY.Image}/${AWS_S3_DIRECTORY.WorkPermit}`;
          break;
        case IdTypes.Passport:
          directory = `${AWS_S3_DIRECTORY.Image}/${AWS_S3_DIRECTORY.Passport}`;
          break;
        default:
          throw new HttpException('Invalid Id Type', HttpStatus.BAD_REQUEST);
      }
      const fetchImage = await this.s3Service.getObjectFromDirectory(
        bucketName,
        directory,
        `${biometricReq.idNumber}.txt`
      );
      if (fetchImage) {
        personImg = Buffer.from(fetchImage, 'base64');
      } else {
        ndiLogger.log(`Getting user's image`);
        personImg = await this.systemRepository
          .getCitizenImg(biometricReq)
          .then((value: string) => Buffer.from(value, 'base64'));
      }
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
      returnResult.statusCode = error.response.statusCode ? error.response.statusCode : CommonConstants.RESP_ERR_500;
      returnResult.error = error.response.error ? error.response.error : CommonConstants.SERVER_ERROR;
    }
    return returnResult;
  }
}
