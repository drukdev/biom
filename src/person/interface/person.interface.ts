import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IdTypes } from '../../common/IdTypes';

export class BiometricReq {

  @ApiProperty({ example: '098f6bcd4621d373cade4e832627b4f6', name: 'idNumber' })
  @IsNotEmpty({ message: 'id should not be empty' })
  @IsString({ message: 'The id is required.' })
  idNumber: string;

  @ApiProperty({ example: IdTypes.Citizenship })
  @IsNotEmpty()
  @IsEnum(IdTypes)
  idType: IdTypes;
  
  @ApiProperty({ example: 'base64', name: 'image' })
  @IsNotEmpty({ message: 'image should not be empty' })
  @IsString({ message: 'The image is required.' })
  image: string;
}


export interface UpdatePersonDetails {
  personId: string;
  deviceId?: string;
  breadcrumb?: string;
}

export interface PersonDetails {
  createdAt: string;
  groups: string[];
  id: string;
  metadata: Metadata;
  name: string;
  updatedAt: string;
}
interface Metadata {
  IDS: string[];
  breadcrumb: string;
  deviceId: string;
  serverTime: string;
  ctx: Ctx;
}
interface Ctx {
  userIp: string;
}