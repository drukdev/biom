import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { FaceSdk, ImageSource } = require('@regulaforensics/facesdk-webclient');

@Injectable()
export class BiometricRepository {
  private readonly logger = new Logger(BiometricRepository.name);
  constructor(private configService: ConfigService) {}
  async compareImage(face1: Buffer, face2: ArrayBufferLike): Promise<number> {
    const apiBasePath = this.configService.get('BM_SDK_BASE_PATH');
    const sdk = new FaceSdk({ basePath: apiBasePath });
    const matchingResponse = await sdk.matchingApi.match({
      images: [
        { type: ImageSource.LIVE, data: face1 },
        { type: ImageSource.DOCUMENT_RFID, data: face1 },
        { data: face2 }
      ],
      thumbnails: true
    });
    this.logger.log('-----------------------------------------------------------------');
    this.logger.log('                         Compare Results                         ');
    this.logger.log('-----------------------------------------------------------------');
    this.logger.log(`result from third party service : ${JSON.stringify(matchingResponse.results)}`);
    return matchingResponse.results.map((res: { similarity: number }) => res.similarity);
  }
}
