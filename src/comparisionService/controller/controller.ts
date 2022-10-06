import {
  Body,
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors} from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import logger from 'lib/logger';
import { BiometricService } from '../services/biometricService';

import { ResponseType } from 'src/common/response';
import { statusCode } from 'src/common/status.codes';
import { FileInterceptor } from '@nestjs/platform-express';
import { PersonDTO } from '../entities/person';

@Controller()
export class PersonController {
  constructor(private readonly biometricService: BiometricService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async compareFace(@UploadedFile() file: Express.Multer.File, @Body() person: PersonDTO) {
    try {
      logger.info('comparing faces');
      console.log(file.buffer);
      console.log("cid : ", person.useCid);
      const result = await this.biometricService.compareImage(file.buffer, person, person.useCid);
      console.log("result", result);
      const res: ResponseType = {
        statusCode: statusCode.INSERT,
        message: 'Response',
        data: result
      };
      return res;
      //todo
    } catch (error) {
      throw new InternalServerErrorException('some Error');
    }
  }
}
