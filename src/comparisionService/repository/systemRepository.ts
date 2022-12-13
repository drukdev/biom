import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as qs from 'qs';
import { PersonDTO } from '../dto/person';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClientCredentialTokenPayloadDto } from '../dto/client-credential-token-payload.dto';
import { lastValueFrom, map } from 'rxjs';
import { AuthTokenResponse } from '../dto/auth-token-res.dto';
import { CommonConstants } from 'src/commons/constants';
import { IdTypes } from 'src/commons/IdTypes';

@Injectable()
export class SystemRepository
{
  private readonly logger = new Logger("systemCallRepository");
  constructor(private readonly httpService: HttpService,
    private configService: ConfigService) { }

  async getCitizenImg (person: PersonDTO)
  {
    this.logger.log(`start to get Citizen Image`)
    try
    {
      if (person.idNumber != null)
      {
        // Get access token
        const sso_url: string = this.configService.get('STAGE_DIIT_SSO') || '';
        const payload = new ClientCredentialTokenPayloadDto();
        payload.client_id = this.configService.get('CLIENT_ID') || '';
        payload.client_secret = this.configService.get('CLIENT_SECRET') || '';
        payload.grant_type = this.configService.get('GRANT_TYPE');

        const config = {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
        this.logger.error(`sso_url : ${ sso_url }`);
        let tokenResponse: string;
        tokenResponse = await lastValueFrom(this.httpService.post(sso_url, qs.stringify(payload), config)
          .pipe(
            map(response =>
            {
              return response.data
            })
          )).then((data: AuthTokenResponse) =>
          {
            return data.access_token;
          });
        if (tokenResponse != null || tokenResponse != undefined)
        {
          const fetchedPerson: PersonDTO = await this.callSystemToGetPerson(tokenResponse, person.idNumber, person.idType);
          this.logger.log(`fetchedPerson : ${ fetchedPerson }`)
          if (fetchedPerson == undefined || fetchedPerson.image == undefined || fetchedPerson.image == null)
          {
            throw new HttpException(
              {
                statusCode: HttpStatus.NOT_FOUND,
                error: 'Citizen data not found. Please update your record',
              },
              HttpStatus.NOT_FOUND
            );
          } else
          {
            this.logger.log(`citizen image : ${ fetchedPerson.image.length }`)
            return fetchedPerson.image;
          }
        }
      }
    }
    catch (err)
    {
      this.logger.error(err);
    }
  }


  async callSystemToGetPerson (token: string, idNumber: string, idType: IdTypes)
  {

    this.logger.log("started calling system")
    let systemurl: string = this.configService.get("CITIZEN_IMG") || '';
    if ((idType.toLowerCase()).match(IdTypes.WorkPermit.toLowerCase()))
    {
      systemurl = this.configService.get('IMMI_IMG') || '';
    }
    // NO API is present for now
    // if ((idType.toLowerCase()).match(IdTypes.Passport.toLowerCase()))
    // {
    //   systemurl = this.configService.get('STAGE_URL_PP') || '';
    // }
    systemurl = `${ systemurl }${ idNumber }`;
    this.logger.log("started calling system : url : ", systemurl)
    try
    {
      let response: PersonDTO = await lastValueFrom(this.httpService.get(systemurl, { headers: { "Authorization": `Bearer ${ token }` } })
        .pipe(
          map(response =>
          {
            return response.data
          })
        )).then((data) =>
        {
          return this.getData(data, idType);
        });

      return response;
    } catch (error)
    {
      this.logger.error(`ERROR in POST : ${ JSON.stringify(error) }`);
      if (
        error
          .toString()
          .includes(CommonConstants.RESP_ERR_HTTP_INVALID_HEADER_VALUE)
      )
      {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            error: CommonConstants.UNAUTH_MSG,
          },
          HttpStatus.UNAUTHORIZED
        );
      }
      if (error.toString().includes(CommonConstants.RESP_ERR_NOT_FOUND))
      {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            error: error.message,
          },
          HttpStatus.NOT_FOUND
        );
      }
      if (error.toString().includes(CommonConstants.RESP_BAD_REQUEST))
      {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            error: error.message,
          },
          HttpStatus.BAD_REQUEST
        );
      }
      if (
        error.toString().includes(CommonConstants.RESP_ERR_UNPROCESSABLE_ENTITY)
      )
      {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            error: error.message,
          },
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      } else
      {
        throw new HttpException(
          {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: "Something went wrong.",
          },
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  getData (data: any, system: string)
  {
    let result: any;
    if (system.match(IdTypes.Citizenship))
    {
      result = Object.keys(data[ "citizenimages" ]).length > 0 ? data[ "citizenimages" ][ "citizenimage" ][ 0 ] : undefined
    }
    if (system.match(IdTypes.WorkPermit))
    {
      result = Object.keys(data[ "ImmiImages" ]).length > 0 ? data[ "ImmiImages" ][ "ImmiImage" ][ 0 ] : undefined
    }
    if (system.match(IdTypes.Passport))
    {
      result = undefined//Object.keys(data[ "PassportDetails" ]).length > 0 ? data[ "PassportDetails" ][ "PassportDetail" ][ 0 ] : undefined
    }
    return result;
  }
}