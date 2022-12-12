import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const {
    FaceSdk,
    ImageSource
} = require('@regulaforensics/facesdk-webclient');

@Injectable()
export class BiometricRepository
{
    private readonly logger = new Logger("biometricRepository");
    constructor(private configService: ConfigService) { }
    async compareImage (face1: Buffer, face2: Buffer)
    {
        let apiBasePath = this.configService.get('BM_SDK_BASE_PATH') || "https://faceapi.regulaforensics.com"
        const sdk = new FaceSdk({ basePath: apiBasePath })
        const matchingResponse = await sdk.matchingApi.match({
            images: [
                { type: ImageSource.LIVE, data: face1 },
                {type: ImageSource.DOCUMENT_RFID, data: face1},
                { data: face2 },
            ],
            thumbnails: true
        })

        this.logger.log("-----------------------------------------------------------------")
        this.logger.log("                         Compare Results                         ")
        this.logger.log("-----------------------------------------------------------------")
        this.logger.log(`result : ${ JSON.stringify(matchingResponse.results) }`)
        return matchingResponse.results.map((res: { similarity: number }) => res.similarity);
    }
}