import { IsString, IsNotEmpty, IsDate, IsBoolean, MaxLength, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { string } from 'joi';
import { Transform, TransformFnParams, Type } from '@nestjs/class-transformer';

export class PersonDTO {
  @IsString()
  @ApiProperty()
  id: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  middleName: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  gender: string;
  
  @IsString()
  @ApiProperty()
  fatherName: string;
  
  @IsString()
  @ApiProperty()
  mobileNumber: string;
  
  @IsString()
  @ApiProperty()
  motherName: string;

  @IsString()
  @ApiProperty()
  occupationDesc: string;

  @IsString()
  @ApiProperty()
  dzongkhagSerialno: string;

  @IsString()
  @ApiProperty()
  gewogSerialno: string;

  @IsString()
  @ApiProperty()
  gewogName: string;

  @IsString()
  @ApiProperty()
  permanentHouseno: string;

  @IsString()
  @ApiProperty()
  permanentThramno: string;

  @IsString()
  @ApiProperty()
  permanentVillageserialno: string;

  @IsString()
  @ApiProperty()
  permanentVillagename: string;

  @IsString()
  @ApiProperty()
  palceOfbirth: string;

  @IsString()
  @ApiProperty()
  countryName: string;

  @IsString()
  @ApiProperty()
  firstNamebh: string;

  @IsString()
  @ApiProperty()
  middleNamebh: string;

  @IsString()
  @ApiProperty()
  lastNamebh: string;

  @IsString()
  @ApiProperty()
  householdNo: string;

  @IsString()
  @ApiProperty()
  dzongkhagName: string;

  @IsNotEmpty()
  dob: Date;

  @IsDate()
  @IsNotEmpty()
  firstissueDate: Date;

  @IsString()
  @ApiProperty()
  idType: string;

  @IsString()
  @ApiProperty()  // @IsNotEmpty()  
  cidNumber: string;

  image: string;

  @IsBoolean()
  useCid: boolean
}

