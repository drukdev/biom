import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NDILogger } from '../../logger/logger.service';
import { LoggerClsStore } from '../../logger/logger.store';
import { AsyncLocalStorage } from 'async_hooks';
import { PersonDetails } from '../interface/person.interface';
import { SearchResponse, Person, SearchImageResponse } from '../response/searchResponse';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { FaceSdk, ImageSource } = require('@regulaforensics/facesdk-webclient');
// eslint-disable-next-line
const md5 = require('md5');
@Injectable()
export class BiometricRepository {
  constructor(
    private configService: ConfigService,
    private readonly als: AsyncLocalStorage<LoggerClsStore>,
    private readonly ndiLogger: NDILogger
  ) {}
  async compareImage(face1: Buffer, face2: ArrayBufferLike): Promise<number> {
    const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
    const apiBasePath = this.configService.get('BM_SDK_BASE_PATH');
    const sdk = new FaceSdk({ basePath: apiBasePath });
    const maxBodyLength = 50 * 1024 * 1024; // 50MB in bytes

    const matchingResponse = await sdk.matchingApi.match(
      {
        images: [
          { index:0, type: ImageSource.LIVE, data: face1 },
          { index:1, type: ImageSource.EXTERNAL, data: face2 }
        ],
        thumbnails: true
      },
      '',
      {
        maxBodyLength
      }
    );

    ndiLogger.log('-----------------------------------------------------------------');
    ndiLogger.log('                         Compare Results                         ');
    ndiLogger.log('-----------------------------------------------------------------');
    ndiLogger.log(`result from third party service`);
    return matchingResponse.results.map((res: { similarity: number }) => res.similarity);
  }


  async fetchPersonDetails(personId: string): Promise<PersonDetails> {
    const apiBasePath = this.configService.get('BM_SDK_BASE_PATH');
    const sdk = new FaceSdk({ basePath: apiBasePath });
    return sdk.personApi.getPerson(personId);
}
async updatePersonMetadata(personId: string, updatePersonDetails: PersonDetails): Promise<PersonDetails> {
  const apiBasePath = this.configService.get('BM_SDK_BASE_PATH');
  const sdk = new FaceSdk({ basePath: apiBasePath });
  return sdk.personApi.updatePerson(personId, updatePersonDetails);
}

async searchImage(image: Buffer, idNumber: string): Promise<SearchImageResponse | number> {
  // return HttpStatus.NOT_FOUND;
  const ndiLogger = this.ndiLogger.getLoggerInstance(this.als);
  const apiBasePath = this.configService.get('BM_SDK_BASE_PATH');
  const commonGroupId: string = this.configService.get('REGULA_GROUP_ID');
  const sdk = new FaceSdk({ basePath: apiBasePath });

  const response: SearchResponse = await sdk.searchApi.search({
    image: { contentType: 'jpg', content: image },
    groupIds: [commonGroupId]
  });

  ndiLogger.log(`Found no of records for ${md5(`${idNumber}`)} ${response.persons.length}`);
  if (0 === response.persons.length) {
    return HttpStatus.NOT_FOUND;
  }
  const matchPerson: Person | undefined = response.persons.find((person) => person.metadata.IDS.includes(md5(idNumber)));
  if (matchPerson) {
    delete matchPerson.metadata.IDS;
    const res: SearchImageResponse = {
      similarity: matchPerson.images.reduce((acc, image) => Math.max(acc, image.similarity), -Infinity),
      ...matchPerson.metadata,
      idNumber,
      personId: matchPerson.id
    };
    ndiLogger.log(`similarity for ${md5(idNumber)} : ${res.similarity}`);
    return res;
  }

  ndiLogger.log(`AMBIGUOUS ${md5(idNumber)} : Not found`);
  return HttpStatus.AMBIGUOUS;

}
}
