import { Injectable, Logger } from '@nestjs/common';
import { PersonDTO } from '../dto/person';
import { BiometricRepository } from '../repository/biometricsRepository';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ResponseService } from 'src/response/src';
import { CommonConstants } from 'src/commons/constants';
import { SystemRepository } from '../repository/systemRepository';
import * as fs from 'fs';
@Injectable()
export class BiometricService
{
  private readonly logger = new Logger("biometricService");
  private biometricRepo: BiometricRepository;
  private systemRepository: SystemRepository;
  constructor(private readonly httpService: HttpService,
    private configService: ConfigService)
  {
    this.biometricRepo = new BiometricRepository(this.configService);
    this.systemRepository = new SystemRepository(this.httpService, this.configService);
  }
  public async compareImage (image: Buffer, person: PersonDTO)
  {
    this.logger.log("Start to compare images")
    let personImg: any;
    let returnResult: ResponseService = new ResponseService();
    try
    {
      const PATH_TO_TEMP = `/src/person/services/temporaryUpload/`;
      switch (person.idNumber)
      {
        case '0190':
        case '0191':
          personImg = this.getPersonImgBuffer(`${ process.env.PWD }${ PATH_TO_TEMP }akshay.jpeg`);
          break;
        case '0194':
        case '0195':
          personImg = this.getPersonImgBuffer(`${ process.env.PWD }${ PATH_TO_TEMP }ekta.jpeg`);
          break;
        case '0192':
        case '0193':
          personImg = this.getPersonImgBuffer(`${ process.env.PWD }${ PATH_TO_TEMP }dhruv.png`);
          break;
        case 'E4089670':
          personImg = this.getPersonImgBuffer(`${ process.env.PWD }${ PATH_TO_TEMP }jacques.png`)
          break;
        case '0197':
        case '0198':
          personImg = this.getPersonImgBuffer(`${ process.env.PWD }${ PATH_TO_TEMP }Sai.jpeg`);
          break;
        case '0199':
        case '0202':
          personImg = this.getPersonImgBuffer(`${ process.env.PWD }${ PATH_TO_TEMP }ankita.jpg`);
          break;
        case '0203':
        case '0204':
          personImg = this.getPersonImgBuffer(`${ process.env.PWD }${ PATH_TO_TEMP }anusha.jpeg`);
          break;
        default:
          personImg = await this.systemRepository.getCitizenImg(person).then((value: string) =>
          {
            return Buffer.from(value, "base64");
          });
      }
      // Start comparing image buffers
      const compatibility: number = await this.biometricRepo.compareImage(image, personImg).then(value =>
      {
        if (value != undefined)
        {
          return value[ 2 ]
        } else
        {
          undefined
        }
      }) || undefined;

      if (compatibility == undefined || compatibility == null)
      {
        returnResult.statusCode = CommonConstants.RESP_BAD_REQUEST;
        returnResult.error = 'Invalid Biometric'
      } else
      {
        let result: boolean = (compatibility > this.configService.get('THRESHOLD')) ? true : false;
        this.logger.debug(`result of comparision : ${ JSON.stringify(result) }`);
        returnResult.statusCode = CommonConstants.RESP_SUCCESS_200;
        returnResult.message = 'success'
        if (!result)
        {
          returnResult.statusCode = CommonConstants.RESP_BAD_REQUEST;
          returnResult.error = 'Invalid Biometric'
        }
        returnResult.data = { compatibility };
      }
    } catch (error)
    {
      this.logger.error(`error in biometric : ${ error }`)
      returnResult.statusCode = CommonConstants.RESP_ERR_500;
      returnResult.error = CommonConstants.SERVER_ERROR;
    }
    return returnResult;
  }

  getPersonImgBuffer (path: string | Buffer | URL)
  {
    return fs.readFileSync(path).buffer
  }
}
