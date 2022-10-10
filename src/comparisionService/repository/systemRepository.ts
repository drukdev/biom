import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as qs from 'qs';
import { PrismaService } from '../../prisma/prisma.service';
import { PersonDTO } from '../dto/person';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ClientCredentialTokenPayloadDto } from '../dto/client-credential-token-payload.dto';
import { lastValueFrom, map } from 'rxjs';
import { AuthTokenResponse } from '../dto/auth-token-res.dto';
import { CommonConstants } from 'src/commons/constants';

@Injectable()
export class SystemRepository {
    private readonly logger = new Logger("systemCallRepository");
    constructor(private readonly prismaService: PrismaService, private readonly httpService: HttpService,
        private configService: ConfigService) {}
        
        async getPersonRecord(person: PersonDTO) {
          console.log("\n---SystemRepository-----here-----");
            if(person.cidNumber != null) {
                // Get access token
                const sso_url: string = this.configService.get('STAGE_DIIT_SSO') || '';
                const payload = new ClientCredentialTokenPayloadDto();
                payload.client_id = this.configService.get('CLIENT_ID') || '';
                payload.client_secret = this.configService.get('CLIENT_SECRET') || '';
                payload.grant_type = "client_credentials";
                
                const config = {
                    headers: {
                      'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
    
                let tokenResponse: string;
                tokenResponse = await lastValueFrom(this.httpService.post(sso_url,qs.stringify(payload), config)
                .pipe(
                    map(response => {
                        return response.data
                    })
                  )).then((data: AuthTokenResponse) => {
                    return data.access_token;
                  });
    
                if(tokenResponse != null || tokenResponse != undefined) {
                    const fetchedPerson: PersonDTO = await this.callSystemToGetPerson(tokenResponse, person.cidNumber);
                    if(fetchedPerson.firstName == person.firstName && 
                      fetchedPerson.lastName == person.lastName) {
                      return true;
                    } else {
                      return false;
                    }
                }
            }
        }
    
    
        async callSystemToGetPerson(token: string, cidNumber: string) {
    
            console.log("started calling dcrc")
            let dcrcUrl: string = this.configService.get("STAGE_URL_DCRC") || '';
            dcrcUrl = `${dcrcUrl}${cidNumber}`;
            console.log("started calling dcrc : url : ", dcrcUrl)
            try {
                let response: PersonDTO = await lastValueFrom(this.httpService.get(dcrcUrl, { headers: { "Authorization": `Bearer ${token}` }})
                .pipe(
                    map(response => {
                        return response.data
                    })
                  )).then((data) => {
                    console.log("data : ", data);
                    return data["citizendetails"]["citizendetail"][0];
                  });
                  console.log("Person found : ", response);
    
                  return response;
                }  catch (error) {
                    this.logger.error(`ERROR in PATCH : ${JSON.stringify(error)}`);
                    if (
                      error
                        .toString()
                        .includes(CommonConstants.RESP_ERR_HTTP_INVALID_HEADER_VALUE)
                    ) {
                      throw new HttpException(
                        {
                          statusCode: HttpStatus.UNAUTHORIZED,
                          error: CommonConstants.UNAUTH_MSG,
                        },
                        HttpStatus.UNAUTHORIZED
                      );
                    }
                    if (error.toString().includes(CommonConstants.RESP_ERR_NOT_FOUND)) {
                      throw new HttpException(
                        {
                          statusCode: HttpStatus.NOT_FOUND,
                          error: error.message,
                        },
                        HttpStatus.NOT_FOUND
                      );
                    }
                    if (error.toString().includes(CommonConstants.RESP_BAD_REQUEST)) {
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
                    ) {
                      throw new HttpException(
                        {
                          statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                          error: error.message,
                        },
                        HttpStatus.UNPROCESSABLE_ENTITY
                      );
                    } else {
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
}