import { ApiResponseProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthTokenResponse {
  @ApiResponseProperty({
    example:
      'eyJhLRsQ'
  })
  @Expose({ name: 'access_token' })
  accessToken: string;

  @ApiResponseProperty({ example: 'email profile' })
  @Expose({ name: 'scope' })
  scope: string;

  @ApiResponseProperty({ example: 86400 })
  @Expose({ name: 'expires_in' })
  expiresIn: number;

  @ApiResponseProperty({ example: 'Bearer' })
  @Expose({ name: 'token_type' })
  tokenType: string;
}
