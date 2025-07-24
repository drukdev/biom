import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsDate, IsBoolean } from 'class-validator';

export class LicenseLimitDto {
  @ApiProperty()
  @IsString()
  orgdid: string;

  @ApiProperty()
  @IsInt()
  usage: number;

  @ApiProperty()
  @IsInt()
  balance: number;

  @ApiProperty()
  @IsInt()
  threshold: number;

  @ApiProperty()
  @IsDate()
  reset_datetime: Date;

  @ApiProperty()
  @IsString()
  orgadmin: string;

  @ApiProperty()
  @IsDate()
  lastupdated: Date;
}

export class LicenseLogDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsString()
  orgdid: string;

  @ApiProperty()
  @IsInt()
  liveliness_count: number;

  @ApiProperty()
  @IsInt()
  match_count: number;

  @ApiProperty()
  @IsInt()
  search_count: number;

  @ApiProperty()
  @IsDate()
  transaction_datetime: Date;

  @ApiProperty()
  @IsBoolean()
  counted: boolean;

  @ApiProperty()
  @IsDate()
  lastupdated: Date;
}
