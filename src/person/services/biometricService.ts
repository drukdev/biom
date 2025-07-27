import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AsyncLocalStorage } from 'async_hooks';
import { BiometricRepository } from '../repository/biometricsRepository';
import { SystemRepository } from '../repository/systemRepository';
import { AWS_S3_DIRECTORY, CommonConstants } from '../../common/constants';
import { NDILogger } from '../../logger/logger.service';
import { LoggerClsStore } from '../../logger/logger.store';
import { ResponseType } from '../../common/response.interface';
import { BiometricReq, PersonDetails, UpdatePersonDetails } from '../interface/person.interface';
import { S3Service } from '../../aws-s3/s3.service';
import { IdTypes } from '../../common/IdTypes';
import { SearchImageResponse } from '../response/searchResponse';
import { RpcException } from '@nestjs/microservices';
import { getDateTime } from '../../common/functions';
import { RegulaPersonDetails } from '../dto/regulaPersonDetails.dto';
import { LicenseService } from '../../license/services/license.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const md5 = require('md5');
const bill_status = [200, 201, 400, 404];
@Injectable()
export class BiometricService {
  constructor(
    private readonly configService: ConfigService,
    private readonly biometricRepo: BiometricRepository,
    private readonly systemRepository: SystemRepository,
    private readonly als: AsyncLocalStorage<LoggerClsStore>,
    private readonly ndiLogger: NDILogger,
    private readonly s3Service: S3Service,
    private readonly licenseService: LicenseService
  ) {}
  public async compareImage(biometricReq: BiometricReq): Promise<ResponseType> {
    switch (biometricReq.idType) {
      case IdTypes.Citizenship:
        return this.compareOneToN(biometricReq);
      case IdTypes.WorkPermit:
      case IdTypes.Passport:
        return this.compareOneToOne(biometricReq);
      default:
        throw new HttpException('Invalid idType', HttpStatus.BAD_REQUEST);
    }
  }

  async compareOneToOne(biometricReq: BiometricReq): Promise<ResponseType> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);

    ndiLogger.log('Start to compare images');
    let personImg: ArrayBufferLike;
    const returnResult = {} as ResponseType;

    try {
      ndiLogger.log('Getting Test user image');
      const bucketName = this.configService.get('USERS_TEST_DATA_BUCKET');
      let directory: string;
      switch (biometricReq.idType) {
        // case IdTypes.Citizenship:
        //   directory = `${AWS_S3_DIRECTORY.Image}/${AWS_S3_DIRECTORY.Citizenship}`;
        //   break;
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
        ndiLogger.log(`Biometric-service-report-log-test-user-image`);
        personImg = Buffer.from(fetchImage, 'base64');
      } else {
        ndiLogger.log(`Biometric-service-report-log-real-user-image`);
        personImg = await this.systemRepository
          .getCitizenImg(biometricReq)
          .then((value: string) => Buffer.from(value, 'base64'));
      }
      const imgBuffer: Buffer = Buffer.from(biometricReq.image, 'base64');

      const compatibility: number = await this.biometricRepo.compareImage(imgBuffer, personImg);

      if (compatibility == undefined || null == compatibility) {
        returnResult.statusCode = CommonConstants.RESP_BAD_REQUEST;
        returnResult.error = 'Invalid Biometric';
      } else {
        const result: boolean = compatibility > this.configService.get('THRESHOLD');
        ndiLogger.log(`Biometric-service-report-log-compatibility-match-${result}`);
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
    } finally {
      if (bill_status.includes(returnResult.statusCode)) {
        await this.licenseService.logUsage(biometricReq.orgdid, 0, 1, 0, JSON.stringify(returnResult));
      }
    }
    return returnResult;
  }

  async compareOneToN(biometricReq: BiometricReq): Promise<ResponseType> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    ndiLogger.log('Start to compare images');
    const returnResult = {} as ResponseType;

    try {
      const inputImgBuffer: Buffer = Buffer.from(biometricReq.image, 'base64');
      let compareResult: SearchImageResponse | number = await this.biometricRepo.searchImage(
        inputImgBuffer,
        biometricReq.idNumber
      );

      if (HttpStatus.NOT_FOUND === compareResult || HttpStatus.AMBIGUOUS === compareResult) {
        ndiLogger.log('Searching record 1:1 way');
        const personImgtemp = await this.systemRepository
          .getCitizenImg(biometricReq);
          const personImg = Buffer.from(personImgtemp, 'base64');
          const similarity =  await this.biometricRepo.compareImage(inputImgBuffer, personImg);
          const regulaData:RegulaPersonDetails = await this.systemRepository.getPersonIDFromRegula(biometricReq.idNumber);
        if (regulaData?.pDetails?.pDetail[0] && regulaData?.pDetails?.pDetail[0].personid && regulaData?.pDetails?.pDetail[0].meta) {
          ndiLogger.log(`similarity for ${md5(`${biometricReq.idNumber}`)}: ${similarity[0]}`);
          compareResult = {
            similarity: similarity[0],
            ...JSON.parse(regulaData.pDetails.pDetail[0].meta),
            idNumber: biometricReq.idNumber,
            personId: regulaData.pDetails.pDetail[0].personid
          };
        }
      }

      if (HttpStatus.NOT_FOUND === compareResult) {
        throw new HttpException('Person not found', HttpStatus.NOT_FOUND);
      }
      if (HttpStatus.AMBIGUOUS === compareResult) {
        throw new HttpException('Record is ambiguous', HttpStatus.AMBIGUOUS);
      }
      if ('number' === typeof compareResult) {
        throw new HttpException('Record is ambiguous', compareResult);
      } else {
        const compatibility = compareResult.similarity;
        const result: boolean = compatibility > this.configService.get('THRESHOLD');

        ndiLogger.log(`Biometric-service-report-log-compatibility-match-${result}`);
        ndiLogger.debug(`result of comparison : ${JSON.stringify(result)}`);
        returnResult.statusCode = HttpStatus.OK;
        returnResult.message = 'success';
        if (!result) {
          returnResult.statusCode = HttpStatus.BAD_REQUEST;
          returnResult.error = 'Invalid Biometric';
        }
        delete compareResult.similarity;
        returnResult.data = { ...compareResult };
      }
    } catch (error) {
      ndiLogger.error(`error in biometric : ${error}`);
      returnResult.statusCode = error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR;
      returnResult.error = error.response ? error.response : CommonConstants.SERVER_ERROR;
    } finally {
.      if (bill_status.includes(returnResult.statusCode)) {
        await this.licenseService.logUsage(biometricReq.orgdid, 0, 0, 1, JSON.stringify(returnResult));
      }
    }
    return returnResult;
  }

  async getPersonDetails(personId: string): Promise<PersonDetails> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    ndiLogger.log('Started to get person details');
    try {
      return await this.biometricRepo.fetchPersonDetails(personId);
    } catch (error) {
      ndiLogger.error(`error while fetching person details - ${JSON.stringify(error)}`);
      if (error?.response?.status === HttpStatus.NOT_FOUND) {
        throw new RpcException({ message: 'Person details not found', code: HttpStatus.NOT_FOUND });
      }
      throw error;
    }
  }

  async getBreadcrumb(personId: string): Promise<string> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    const personDetails = await this.getPersonDetails(personId);
    if (!personDetails) {
      ndiLogger.error(`Person details not found`);
      throw new RpcException({ message: 'Person details not found', code: HttpStatus.NOT_FOUND });
    }
    ndiLogger.log(`Person details found`);
    return personDetails?.metadata?.breadcrumb;
  }

  async fetchDeviceId(personId: string): Promise<string> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    const personDetails = await this.getPersonDetails(personId);
    if (!personDetails) {
      ndiLogger.error(`Person details not found`);
      throw new RpcException({ message: 'Person details not found', code: HttpStatus.NOT_FOUND });
    }
    ndiLogger.log(`Person details found`);

    return personDetails?.metadata?.deviceId;
  }

  public async updateMetadata(personMetaData: UpdatePersonDetails): Promise<ResponseType> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    try {
      const returnResult = {} as ResponseType;
      const { personId } = personMetaData;
      const fetchPersonDetails = await this.biometricRepo.fetchPersonDetails(personId);

      if (personMetaData.deviceId) {
        fetchPersonDetails.metadata['deviceId'] = personMetaData.deviceId;
      }
      if (null === personMetaData.breadcrumb || personMetaData.breadcrumb) {
        fetchPersonDetails.metadata['breadcrumb'] = personMetaData.breadcrumb;
        fetchPersonDetails.metadata['breadcrumbUpdatedAt'] = getDateTime();
      }

      const updateMetaData = await this.biometricRepo.updatePersonMetadata(personId, fetchPersonDetails);

      returnResult.statusCode = HttpStatus.OK;
      returnResult.message = 'success';
      returnResult.data = updateMetaData;
      return returnResult;
    } catch (error) {
      ndiLogger.error(`Error while updating person metadata : ${error}`);
      const statusCode = error.response.status ? error.response.status : HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage = error.response.statusText
        ? error.response.statusText
        : CommonConstants.UPDATE_METADATA_ERROR;
      throw new RpcException({ message: errorMessage, code: statusCode });
    }
  }


}
