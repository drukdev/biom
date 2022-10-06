import { Injectable } from '@nestjs/common';
import { PersonDTO } from '../entities/person';
import { PrismaService } from '../../prisma/prisma.service';
import { BiometricRepository } from '../repository/biometricsRepository';
import * as jimp from 'jimp'; 

@Injectable()
export class BiometricService {
  private biometricRepo: BiometricRepository;
  constructor(private readonly prismaService: PrismaService) {
    this.biometricRepo = new BiometricRepository(this.prismaService);
  }
  public async compareImage(image: Buffer, person: PersonDTO, useCid: Boolean) {
    let personImg: any;
    if(useCid) {
      console.log("in if")
      personImg = this.biometricRepo.getPersonRecord(person).image;
    } else {
      console.log("in else")
      // load default data barack obama1.jpeg
      personImg = `${process.env.PWD}/src/comparisionService/services/extra/obama2.jpeg`;
    }
    // Start comparing image buffers
    const compatibility = await this.biometricRepo.compareImage(image, personImg).then(value => {

      console.log(typeof value)
      return value;
    });
    const result: Boolean = (compatibility > 70) ? true : false;
    const payload = {
      compatibility,
      result
    }
    return payload;
  }
}
