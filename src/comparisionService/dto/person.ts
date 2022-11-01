import { IsString, IsNotEmpty, IsDate, IsBoolean, MaxLength, ValidateIf, isString, isNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IdTypes } from 'src/commons/IdTypes';
import { BloodType } from 'src/commons/bloodType';

export class PersonDTO {

  @ApiPropertyOptional()
  id: string;

  @ApiProperty({
    name: 'fullName' || 'FullName',
    type: String
  })
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @ApiProperty({
    name: 'gender',
    type: String
  })
  @IsNotEmpty()
  gender: string;

  @IsEnum(BloodType)
  @ApiProperty({
    name: 'bloodType',
    enum : BloodType
  })
  @IsNotEmpty()
  bloodType: BloodType;
  
  @IsString()
  @ApiProperty({
    name: 'gewog' || 'gewogName',
    type: String
  })
  gewogName: string;

  @IsString()
  @ApiProperty({
    name: 'dzongkhag' || 'dzongkhagName',
    type: String
  })
  @IsNotEmpty()
  dzongkhagName: string;

  @ApiProperty({
    name: 'village' || 'villagename',
    type: String
  })
  villagename: string;

  @IsEnum(IdTypes)
  @ApiProperty({
    name: 'idType',
    enum: IdTypes
  })
  @IsNotEmpty()
  idType: IdTypes;

  @ApiProperty({
    name: 'idNumber',
    type: Number
  })
  @IsNotEmpty()
  idNumber: string;

  @ApiPropertyOptional({
    name: 'image',
    type: String
  })
  image: string;

  @ApiProperty({
    name: 'isBhutanese',
    type: Boolean
  })
  @IsNotEmpty()
  isBhutanese: boolean

  @ApiProperty({
    name: 'country' || 'Country',
    type: String
  })
  country: string

  @ApiPropertyOptional({
    name: 'UniqueID',
    type: String
  })
  uniqueID: string

  @ApiProperty({
    name: 'WorkPermit',
    type: Number
  })
  workPermit: number
  
  @ApiProperty({
    name: 'DOB' || 'dob',
    type: Date
  })
  dob: Date
  
  @ApiProperty({
    name: 'Job_Category' || 'jobCategory',
    type: String
  })
  jobCategory: string

  @ApiProperty({
    name: 'EmployerName' || 'employerName',
    type: String
  })
  employerName: string

  firstName: string;
  middleName: string;
  lastName: string;
  fatherName: string;
  mobileNumber: string;
  motherName: string;
  occupationDesc: string;
  dzongkhagSerialno: number;
  gewogSerialno: number;
  permanentHouseno: string;
  permanentThramno: string;
  permanentVillageserialno: number;
  permanentVillagename: string;
  palceOfbirth: string;
  countryName: string;
  firstNamebh: string;
  middleNamebh: string;
  lastNamebh: string;
  householdNo: number;
  firstissueDate: Date;
}