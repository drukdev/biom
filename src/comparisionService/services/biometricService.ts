import { Injectable, Logger } from '@nestjs/common';
import { PersonDTO } from '../dto/person';
import { PrismaService } from '../../prisma/prisma.service';
import { BiometricRepository } from '../repository/biometricsRepository';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ResponseService } from 'src/response/src';
import { CommonConstants } from 'src/commons/constants';
import { SystemRepository } from '../repository/systemRepository';

@Injectable()
export class BiometricService
{
  private readonly logger = new Logger("biometricService");
  private biometricRepo: BiometricRepository;
  private systemRepository: SystemRepository;
  constructor(private readonly prismaService: PrismaService, private readonly httpService: HttpService,
    private configService: ConfigService)
  {
    this.biometricRepo = new BiometricRepository(this.prismaService, this.httpService, this.configService);
    this.systemRepository = new SystemRepository(this.prismaService, this.httpService, this.configService);
  }
  public async compareImage (image: Buffer, person: PersonDTO, useCid: boolean)
  {
    this.logger.log("Start to compare images")
    let personImg: Buffer;
    let result: boolean = false;
    let returnResult: ResponseService = new ResponseService();

    personImg = await this.systemRepository.getCitizenImg(person).then((value: string) =>
    {
      return Buffer.from(value, "base64");;
    });
    // personImg = `${process.env.PWD}/src/comparisionService/services/temporaryUpload/obama2.jpeg`;

    // Start comparing image buffers
    try
    {
      const compatibility = await this.biometricRepo.compareImage(image, personImg).then(value =>
      {
        this.logger.log(typeof value)
        return value;
      }) || '';
      result = (compatibility > 75) ? true : false;
      returnResult.code = CommonConstants.RESP_SUCCESS_201;
      returnResult.data = { compatibility };
      returnResult.success = result;
    } catch (error)
    {
      returnResult.code = CommonConstants.RESP_ERR_500;
      returnResult.data = {};
      returnResult.message = CommonConstants.SERVER_ERROR;
      returnResult.success = false;
    }
    return returnResult;
  }
}
