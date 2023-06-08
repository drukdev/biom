import { Body, Controller, InternalServerErrorException, Logger, Post, UseGuards } from '@nestjs/common';
import { BiometricService } from '../services/biometricService';
import { CommonConstants, ServiceConstants } from 'src/common/constants';
import { MessagePattern } from '@nestjs/microservices';
import { PersonDTO } from '../dto/person';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ResponseType } from 'src/common/response.interface';
import { statusCode } from 'src/common/status.codes';
import { IdTypes } from 'src/common/IdTypes';

@Controller()
@ApiBearerAuth()
export class PersonController {
  private readonly logger = new Logger(PersonController.name);
  constructor(private readonly biometricService: BiometricService) {}

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
    try {
      this.logger.log(`compareBiometric starts`);

      if ('undefined' == typeof newPerson.fullName || 'undefined' == typeof newPerson.idNumber) {
        this.logger.log('BAD REQUEST');
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
      this.logger.log(`result : ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @MessagePattern({
    endpoint: `${ServiceConstants.NATS_ENDPOINT}/${ServiceConstants.COMPARE_BM}`
  })
  async compareBiometric(@Body() person: PersonDTO): Promise<ResponseType> {
    try {
      this.logger.log(`compareBiometric starts`);

      this.logger.log((!person.isBhutanese && person.idType.includes(IdTypes.Citizenship)) || (!person.isBhutanese && [IdTypes.Passport, IdTypes.WorkPermit].includes(person.idType)));

      if ('undefined' == typeof person.fullName || 'undefined' == typeof person.idNumber) {
        if ((!person.isBhutanese && person.idType.includes(IdTypes.Citizenship)) && (!person.isBhutanese && [IdTypes.Passport, IdTypes.WorkPermit].includes(person.idType))) {
        this.logger.log('BAD REQUEST');
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
      this.logger.log(`result : ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
