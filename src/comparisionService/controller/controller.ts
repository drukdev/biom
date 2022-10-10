import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors} from '@nestjs/common';
import logger from 'lib/logger';
import base64ToImage from 'base64-to-image';
import { BiometricService } from '../services/biometricService';
import { FileInterceptor } from '@nestjs/platform-express';
import { PersonDTO } from '../dto/person';
import { ResponseService } from 'src/response/src';
import { response } from 'express';
import { CommonConstants } from 'src/commons/constants';
import { ApiBody } from '@nestjs/swagger';

@Controller()
export class PersonController {
  constructor(private readonly biometricService: BiometricService) {}

  @Post('upload')
  async compareFace(@Body() newPerson: any ) {
    try {
      let result: ResponseService = new ResponseService();
      logger.info('comparing faces');
      
      if((typeof newPerson.firstName) == 'undefined' || (typeof newPerson.lastName) == 'undefined' || 
          (typeof newPerson.middleName) == 'undefined' || (typeof newPerson.cidNumber) == 'undefined') {
        console.log("in if")
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
      console.log("result", result);
      return result;
      //todo
    } catch (error) {
      throw new InternalServerErrorException('some Error');
    }
  }


  @Post("/user")
  @ApiBody({ type: PersonDTO })
  savePerson(@Body() person: any) {
    try {
      return person;
    } catch (error) {
      console.error(error);
    }
    
  }
}
