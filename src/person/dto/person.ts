import { IsString, IsBoolean, IsEnum, IsNotEmpty, IsOptional, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IdTypes } from '../../common/IdTypes';
import { BloodType } from '../../common/bloodType';
import { Expose } from 'class-transformer';

export class PersonDTO {
  @ApiPropertyOptional({ example: null })
  id: string;

  @ApiProperty({ name: 'fullName', type: String, example: 'Demo' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ name: 'gender', type: String, example: 'Male' })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsEnum(BloodType)
  @ApiProperty({
    example: BloodType.AB_NEG,
    name: 'bloodType',
    enum: BloodType
  })
  @IsOptional()
  bloodType: BloodType;

  @ApiProperty({ name: 'isBhutanese', type: Boolean, example: false })
  @IsNotEmpty()
  @IsBoolean()
  isBhutanese: boolean;

  // @ValidateIf((obj) => true === obj.isBhutanese)
  @ApiProperty({ name: 'gewogName', type: String, example: null })
  // @IsNotEmpty()
  // @IsString()
  gewogName: string;

  // @ValidateIf((obj) => true === obj.isBhutanese)
  @ApiProperty({ name: 'dzongkhagName', type: String, example: null })
  // @IsNotEmpty()
  // @IsString()
  dzongkhagName: string;

  // @ValidateIf((obj) => true === obj.isBhutanese)
  @ApiProperty({ name: 'village', type: String, example: null })
  // @IsNotEmpty({ message: 'village should not be empty' })
  // @IsString({ message: 'village must be a string' })
  @Expose({ name: 'village' })
  villagename: string;

  @IsEnum(IdTypes, {
    message: 'idType Must be a Passport, a WorkPermit, or a Citizenship'
  })
  @IsNotEmpty({ message: 'idType should not be empty' })
  @ApiProperty({ name: 'idType', enum: IdTypes, example: IdTypes.WorkPermit })
  idType: IdTypes;

  @ApiProperty({ name: 'idNumber', type: Number, example: '0196' })
  @IsNotEmpty({ message: 'idNumber should not be empty' })
  @IsString({ message: 'idNumber must be a string' })
  idNumber: string;

  @ApiPropertyOptional({ name: 'image', type: String, example: '' })
  @IsNotEmpty({ message: 'image should not be empty' })
  @IsString({ message: 'image must be a string' })
  image: string;

  @ValidateIf((obj) => false === obj.isBhutanese)
  @ApiProperty({
    name: 'country' || 'Country',
    type: String,
    example: 'Australia'
  })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiPropertyOptional({
    name: 'UniqueID',
    type: String,
    example: 'unique-id-01'
  })
  uniqueID: string;

  // @ValidateIf((obj) => false === obj.isBhutanese)
  @ApiProperty({ name: 'WorkPermit', type: Number, example: 196 })
  // @IsNotEmpty({ message: 'WorkPermit should not be empty' })
  @Expose({ name: 'WorkPermit' })
  workPermit: number;

  workPermitNo: number;
  workerName: string;
  genderId: string;
  passport: string;

  @ApiProperty({
    name: 'DOB' || 'dob',
    type: Date,
    example: '1998-01-01+00:00'
  })
  dob: Date;

  // @ValidateIf((obj) => false === obj.isBhutanese)
  @ApiProperty({ name: 'jobCategory', type: String, example: 'Engineer' })
  // @IsNotEmpty()
  // @IsString()
  jobCategory: string;

  // @ValidateIf((obj) => false === obj.isBhutanese)
  @ApiProperty({ name: 'employerName', type: String, example: 'NDI' })
  // @IsNotEmpty()
  // @IsString()
  employerName: string;

  @ApiProperty({ name: 'biometric', type: Boolean })
  biometric = true;

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

  formRoyalUser(royalUser): void {
    this.id = royalUser.id;
    this.firstName = royalUser.First_Name;
    this.middleName = royalUser.Middle_Name;
    this.lastName = royalUser.Last_Name;
    this.gender = royalUser.Gender;
    // this.fatherName = undefined;
    // this.mobileNumber = '';
    // this.motherName = '';
    // this.occupationDesc = '';
    // this.dzongkhagSerialno= '';
    // this.:gewogSerialno = '';
    // this.permanentHouseno = '';
    this.permanentThramno = royalUser.Present_Thram_No;
    this.permanentVillageserialno = royalUser.Present_Village_Serial_No;
    // this.permanentVillagename= '';
    // this.palceOfbirth = '';
    // this.countryName = '';
    this.firstNamebh = royalUser.First_Name_Bh;
    this.middleNamebh = royalUser.Middle_Name_Bh;
    this.lastNamebh = royalUser.Last_Name_Bh;
    this.householdNo = royalUser.Present_HouseHold_No;
    this.firstissueDate = royalUser.Record_Date;
  }
}
