import { IsString, IsNotEmpty, IsDate, IsBoolean } from 'class-validator';
import { isString } from 'util';

export class PersonDTO {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  firstname: string;

  @IsString()
  @IsNotEmpty()
  middlename: string;

  @IsString()
  @IsNotEmpty()
  lastname: string;


  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsDate()
  @IsNotEmpty()
  dateOfBirth: Date;

  @IsString()
  @IsNotEmpty()
  idType: string;

  @IsString()
  @IsNotEmpty()
  cid: string;

  image: Buffer;

  @IsBoolean()
  useCid: Boolean
}
