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
    let result: boolean = false;
    let returnResult: ResponseService = new ResponseService();
    try
    {
      if ([ '0190', '0191' ].includes(person.idNumber))
      {
        personImg = this.getPersonImgBuffer(`${ process.env.PWD }/src/comparisionService/services/temporaryUpload/akshay.jpeg`);
      } else if ([ '0194', '0195' ].includes(person.idNumber))
      {
        personImg = this.getPersonImgBuffer(`${ process.env.PWD }/src/comparisionService/services/temporaryUpload/ekta.jpeg`);
      } else if ([ '0192', '0193' ].includes(person.idNumber))
      {
        personImg = this.getPersonImgBuffer(`${ process.env.PWD }/src/comparisionService/services/temporaryUpload/Dhruv.png`)
      } else if ( person.idNumber == 'E4089670')
      {
        personImg = this.getPersonImgBuffer(`${ process.env.PWD }/src/comparisionService/services/temporaryUpload/jacques.png`)
      } else
      {
        personImg = await this.systemRepository.getCitizenImg(person).then((value: string) =>
        {
          return Buffer.from(value, "base64");
        });
      }
      // Start comparing image buffers
      const compatibility: number = await this.biometricRepo.compareImage(image, personImg).then(value =>
      {
        this.logger.log(`result : ${ JSON.stringify(value) } ---- ${ (value.length) }`)
        if (value != undefined)
        {
          return value[ 2 ]
        } else
        {
          undefined
        }
      }) || undefined;
      this.logger.log(`result of comparision ${ result }`);
      this.logger.log(`result of compatibility ${ compatibility }`);
      if (compatibility == undefined || compatibility == null)
      {
        returnResult.statusCode = CommonConstants.RESP_BAD_REQUEST;
        returnResult.error = 'Invalid Biometric'
      } else
      {
        result = (compatibility > this.configService.get('THRESHOLD')) ? true : false;
        this.logger.debug(`result : ${ JSON.stringify(result) }`);
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

  getPersonImgBuffer (path)
  {
    return fs.readFileSync(path).buffer
  }
}
