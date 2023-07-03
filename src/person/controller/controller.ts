import { Body, Controller, InternalServerErrorException, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { BiometricService } from '../../person/services/biometricService';
import { CommonConstants, ServiceConstants } from '../../common/constants';
import { MessagePattern } from '@nestjs/microservices';
import { PersonDTO } from '../../person/dto/person';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ResponseType } from '../../common/response.interface';
import { statusCode } from '../../common/status.codes';
import { IdTypes } from '../../common/IdTypes';
import { NDILogger } from '../../logger/logger.service';
import { LoggerClsStore } from '../../logger/logger.store';
import { AsyncLocalStorage } from 'async_hooks';
import { LoggingInterceptor } from '../../logger/logging.interceptor';

@Controller()
@ApiBearerAuth()
export class PersonController {
  constructor(
    private readonly biometricService: BiometricService,
    private readonly als: AsyncLocalStorage<LoggerClsStore>,
    private readonly ndiLogger: NDILogger
    ) {}

  @Post('validate')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({
    summary: 'Validates user biometric',
    description: `This endpoint is responsible to match the biometric of the user with the one from the DCRC or DOI data`
  })
  @ApiResponse({
    status: 200,
    description: 'Returns compatibility and result'
  })
  async compareBiometricAPI(@Body() newPerson: PersonDTO): Promise<ResponseType> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    try {
      ndiLogger.log(`compareBiometric starts`);

      if ('undefined' == typeof newPerson.fullName || 'undefined' == typeof newPerson.idNumber) {
        ndiLogger.log('BAD REQUEST');
        const result: ResponseType = {
          statusCode: statusCode.BAD_REQUEST,
          data: newPerson,
          error: 'Mandatory fields are not present',
          message: CommonConstants.BAD_REQUEST.toString()
        };
        return result;
      }

      // Base64 string to image
      const imgBuffer: Buffer = Buffer.from(newPerson.image, 'base64');
      const result = await this.biometricService.compareImage(imgBuffer, newPerson);
      ndiLogger.log(`result : ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseInterceptors(LoggingInterceptor)
  @MessagePattern({
    endpoint: `${ServiceConstants.NATS_ENDPOINT}/${ServiceConstants.COMPARE_BM}`
  })
  async compareBiometric(@Body() person: PersonDTO): Promise<ResponseType> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    try {
      ndiLogger.log(`compareBiometric starts`);

    ndiLogger.log(`${(!person.isBhutanese && person.idType.includes(IdTypes.Citizenship))} || ${(!person.isBhutanese && [IdTypes.Passport, IdTypes.WorkPermit].includes(person.idType))}`);

      if ('undefined' == typeof person.fullName || 'undefined' == typeof person.idNumber) {
        if ((!person.isBhutanese && person.idType.includes(IdTypes.Citizenship)) && (!person.isBhutanese && [IdTypes.Passport, IdTypes.WorkPermit].includes(person.idType))) {
        ndiLogger.log('BAD REQUEST');
        const result: ResponseType = {
          statusCode: statusCode.BAD_REQUEST,
          data: person,
          error: 'Mandatory fields are not present',
          message: CommonConstants.BAD_REQUEST.toString()
        };
        return result;
      }
      }

      // Base64 string to image
      const imgBuffer: Buffer = Buffer.from(person.image, 'base64');
      const result = await this.biometricService.compareImage(imgBuffer, person);
      ndiLogger.log(`result : ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
