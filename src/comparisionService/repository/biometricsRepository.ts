import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as jimp from 'jimp';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BiometricRepository
{

    private readonly logger = new Logger("biometricRepository");

    constructor(private readonly httpService: HttpService,
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
                this.logger.log(`typeof image1 ${ typeof image1 } \n image2 : ${ image2 }`)
                const img1Buffer: Buffer | undefined = await this.resizeUpdateImage(image1).then(value =>
                {
                    return value
                }).catch((error) =>
                {
                    this.logger.error(`error : ${ error }`)
                    return undefined;
                });
                const img2Buffer: Buffer | undefined = await this.resizeUpdateImage(image2).then(value => { return value });
                if (img1Buffer != undefined && img2Buffer != undefined)
                {
                    return await this.computeDiff(img1Buffer, img2Buffer).then(value =>
                    {
                        return value;
                    });
                } else
                {
                    return undefined;
                }
            }
        } catch (error)
        {
            this.logger.error(error)
            return undefined;
        }
    }

    async resizeUpdateImage (image: Buffer): Promise<Buffer | undefined>
    {
        try
        {
            return new Promise(async (resolve, reject) =>
            {
                this.logger.log(`typeof image ${ typeof image }`)
                try
                {
                    jimp.read(image).then(img => 
                    {
                        try
                        {
                            img.quality(100)
                                .grayscale()
                                .resize(280, 280);//.writeAsync(str);
                        } catch (err)
                        {
                            this.logger.error("error in resizing", err);
                            reject("Could not read image.");
                            return undefined;
                        }

                        // return img;

                        return img.getBuffer(jimp.MIME_PNG, (err, buf) =>
                        {
                            if (err)
                            {
                                this.logger.error(`error converting image url to buffer: ${ err }`);
                                reject("Could not read image.");
                                return undefined;
                            }
                            resolve(buf)
                        });
                    }).catch((error) =>
                    {
                        this.logger.error(`error : ${ error }`)
                        reject("Could not read image.");
                        return undefined;
                    });
                } catch (err)
                {
                    this.logger.error(
                        "error in reading img", err
                    )
                    reject("Could not read image.");
                    return undefined;
                }
            });
        } catch (error)
        {
            this.logger.error(error);
            return undefined;
        }
    }


    private async computeDiff (img1Buffer: Buffer, img2Buffer: Buffer)
    {
        try
        {
            this.logger.log(`Started computing diff of two images`);
            const image1 = await jimp.read(img1Buffer);
            const image2 = await jimp.read(img2Buffer);

            // Perceived distance
            const distance = jimp.distance(image1, image2);
            // Pixel difference
            const diff = jimp.diff(image1, image2);
            let compatibility: number = diff.percent * 100;
            this.logger.log(`Compatibility: ${ compatibility }`);
            this.logger.log(`compareImages: distance: ${ distance.toFixed(3) }, diff.percent: ${ diff.percent.toFixed(3) }`);
            const threshold = 0.30;
            if (distance < threshold || diff.percent < threshold)
            {
                this.logger.log(`compareImages: Images match! ${(100 - compatibility)}`);
                return Math.round((100 - compatibility));
            } else
            {
                this.logger.log("compareImages: Images do NOT match!");
                return Math.round((100 - compatibility));
            }

            // const img1 = PNG.sync.read(img1Buffer);
            // const img2 = PNG.sync.read(img2Buffer);
            // const { width, height } = img1;
            // const pngdiff = new PNG({ width, height });
            // const diff = new PNG({ width, height });
            // const difference = pixelmatch(
            //     img1.data,
            //     img2.data,
            //     null,
            //     width,
            //     height,
            //     {
            //         threshold: 0.45,
            //     }
            // );

            // const compatibility: number = 100 - (difference * 100) / (width * height);
            // this.logger.log(`${ difference } pixels differences`);
            // this.logger.log(`Compatibility: ${compatibility}`);
            // this.logger.log(`Completed comparing two images`);
            // return compatibility;

        } catch (error)
        {
            this.logger.error("error : ", error);
        }
    }
}