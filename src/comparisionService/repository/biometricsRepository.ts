import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as jimp from 'jimp'; 
import { PNG } from 'pngjs'; 
import pixelmatch from 'pixelmatch';
import qs from 'qs';
import { PrismaService } from '../../prisma/prisma.service';
import { PersonDTO } from '../dto/person';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BiometricRepository {

    private readonly logger = new Logger("biometricRepository");
    
    constructor(private readonly prismaService: PrismaService, private readonly httpService: HttpService,
        private configService: ConfigService) {}

    public async compareImage(image1: Buffer, image2) {
            
        try {
            if(image1 == undefined || image2 == undefined) {
                throw new HttpException({
                    status: 500,
                    error: "message",
                }, 500);
            } else {

                // facecrop(image2,'./output.jpg', "image/jpeg", 0.95, 50);
                const img1Buffer: Buffer = await this.imgToBuffer(image1).then(value => {
                    return value
                });
                const img2Buffer: Buffer = await this.imgToBuffer(image2).then(value => {return value});
                return await this.computeDiff(img1Buffer, img2Buffer).then(value => {
                    return value;
                });
            }
        } catch(error) {
            this.logger.error(error)
        }
    }

    async imgToBuffer(image: Buffer): Promise<Buffer> {

        return new Promise( async (resolve, reject) => {
            console.log("typeof image",typeof image)
            jimp.read(image).then(img => 
                {
                    img.resize(280, 280)
                    .quality(100)
                    .grayscale();

                    return img.getBuffer(jimp.MIME_PNG, (err, buf) => {
                        if (err) {
                            console.log(`error converting image url to buffer: ${err}`);
                            reject(err)
                        }
                        resolve(buf)
                    });
                });
            });
        }


    private async computeDiff(img1Buffer: Buffer, img2Buffer: Buffer) {
        const img1 = PNG.sync.read(img1Buffer);
        const img2 = PNG.sync.read(img2Buffer);
        const { width, height } = img1;
        const diff = new PNG({ width, height });

        const difference = pixelmatch(
            img1.data,
            img2.data,
            diff.data,
            width,
            height,
            {
                threshold: 0.5,
            }
        );

        const compatibility: number = 100 - (difference * 100) / (width * height);
        console.log(`${difference} pixels differences`);
        console.log("Compatibility: ${",compatibility);
        console.log('< Completed comparing two images');
        return compatibility;
    }

    

}