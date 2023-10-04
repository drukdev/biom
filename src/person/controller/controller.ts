import { Body, Controller, InternalServerErrorException, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { BiometricService } from '../../person/services/biometricService';
import { MessagePattern } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ResponseType } from '../../common/response.interface';
import {  ServiceConstants } from '../../common/constants';
import { IdTypes } from '../../common/IdTypes';
import { NDILogger } from '../../logger/logger.service';
import { LoggerClsStore } from '../../logger/logger.store';
import { AsyncLocalStorage } from 'async_hooks';
import { LoggingInterceptor } from '../../logger/logging.interceptor';
import { BiometricReq } from '../interface/person.interface';

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
  async compareBiometricAPI(@Body() biometricReq: BiometricReq): Promise<ResponseType> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    try {
      ndiLogger.log(`compareBiometric starts`);

      // Base64 string to image
      const imgBuffer: Buffer = Buffer.from(biometricReq.image, 'base64');
      const result = await this.biometricService.compareImage(imgBuffer, biometricReq);
      ndiLogger.log(`result : ${JSON.stringify(result)}`);
      ndiLogger.log(`compareBiometric ends`);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @UseInterceptors(LoggingInterceptor)
  @MessagePattern({
    endpoint: `${ServiceConstants.NATS_ENDPOINT}/${ServiceConstants.BM_VALIDATE_USER}`
  })
  async compareBiometric(@Body() biometricReq: BiometricReq): Promise<ResponseType> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    try {
      ndiLogger.log(`compareBiometric starts`);

      ndiLogger.log(
        `${biometricReq.idType.includes(IdTypes.Citizenship)} || ${[IdTypes.Passport, IdTypes.WorkPermit].includes(
          biometricReq.idType
        )}`
      );

      // Base64 string to image
      const imgBuffer: Buffer = Buffer.from(biometricReq.image, 'base64');
      const result = await this.biometricService.compareImage(imgBuffer, biometricReq);
      ndiLogger.log(`result : ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
