import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as jimp from 'jimp';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { PrismaService } from '../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BiometricRepository
{

    private readonly logger = new Logger("biometricRepository");

    constructor(private readonly prismaService: PrismaService, private readonly httpService: HttpService,
        private configService: ConfigService) { }

    public async compareImage (image1: Buffer, image2)
    {

        try
        {
            if (image1 == undefined || image2 == undefined)
            {
                throw new HttpException({
                    status: 500,
                    error: "message",
                }, 500);
            } else
            {

                // facecrop(image2,'./output.jpg', "image/jpeg", 0.95, 50);
                const img1Buffer: Buffer | undefined = await this.imgToBuffer(image1).then(value =>
                {
                    return value
                });
                const img2Buffer: Buffer | undefined = await this.imgToBuffer(image2).then(value => { return value });
                if (img1Buffer != undefined && img2Buffer != undefined)
                {
                    return await this.computeDiff(img1Buffer, img2Buffer).then(value =>
                    {
                        return value;
                    });
                }
            }
        } catch (error)
        {
            this.logger.error(error)
        }
    }

    async imgToBuffer (image: Buffer): Promise<Buffer | undefined>
    {

        try
        {
            return new Promise(async (resolve, reject) =>
            {
                this.logger.log("typeof image", typeof image)
                try
                {
                    jimp.read(image).then(img => 
                    {
                        try
                        {
                            img.resize(280, 280)
                            .quality(100)
                            .grayscale();
                        } catch (err)
                        {
                            this.logger.error("error in resizing", err);
                        }

                        return img.getBuffer(jimp.MIME_PNG, (err, buf) =>
                        {
                            if (err)
                            {
                                console.log(`error converting image url to buffer: ${ err }`);
                                reject(err)
                            }
                            resolve(buf)
                        });
                    });
                } catch (err)
                {
                    this.logger.error(
                        "error in reading img", err
                    )
                }
            });
        } catch (error)
        {
            this.logger.error(error);
        }
    }


    private async computeDiff (img1Buffer: Buffer, img2Buffer: Buffer)
    {
        try
        {
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
                    threshold: 0.2,
                }
            );

            const compatibility: number = 100 - (difference * 100) / (width * height);
            console.log(`${ difference } pixels differences`);
            console.log("Compatibility: ${", compatibility);
            console.log('< Completed comparing two images');
            return compatibility;

        } catch (error)
        {
            this.logger.error("error : ", error);
        }
    }
}