import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NDILogger } from '../../logger/logger.service';
import { LoggerClsStore } from '../../logger/logger.store';
import { AsyncLocalStorage } from 'async_hooks';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { FaceSdk, ImageSource } = require('@regulaforensics/facesdk-webclient');

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
          { type: ImageSource.LIVE, data: face1 },
          { type: ImageSource.DOCUMENT_RFID, data: face1 },
          { data: face2 }
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
}
