import {
  Body,
  Controller,
  InternalServerErrorException,
  Logger,
  Post} from '@nestjs/common';
import { BiometricService } from '../services/biometricService';
import { ResponseService } from 'src/response/src';
import { CommonConstants } from 'src/commons/constants';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class PersonController {
  private readonly logger = new Logger("PersonController");
  constructor(private readonly biometricService: BiometricService) {}

  @Post('validate')
  @MessagePattern({
    endpoint: 'biometricService/compareBiometrics'
  })
  async compareFace(@Body() newPerson: any) {
    try {
      let result: ResponseService = new ResponseService();
      this.logger.log(`comparing faces : ${JSON.stringify(newPerson)}`);
      
      if((typeof newPerson.fullName) == 'undefined' || (typeof newPerson.idNumber) == 'undefined') {
        this.logger.log("in if")
        return result.response(
          'Mandatory fields are not present',
          false,
          {},
          CommonConstants.RESP_BAD_REQUEST
      );
      }

      // Base64 string to image
      const imgBuffer: Buffer = Buffer.from(newPerson.image, "base64");

      result = await this.biometricService.compareImage(imgBuffer, newPerson, newPerson.useCid);
      this.logger.log("result", result);
      return result;
      //todo
    } catch (error) {
      throw new InternalServerErrorException('some Error');
    }
  }
}
