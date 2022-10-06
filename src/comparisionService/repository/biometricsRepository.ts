import { Injectable } from '@nestjs/common';
import * as jimp from 'jimp'; 
import { PNG } from 'pngjs'; 
import * as faceapi from 'face-api.js'; 
import pixelmatch from 'pixelmatch';

// const fs = require('fs');
// const path = require('path');
// const { tinyFaceDetector } = require('face-api.js');

import { PrismaService } from '../../prisma/prisma.service';
import { buffer } from 'stream/consumers';
import { PersonDTO } from '../entities/person';
import { resourceLimits } from 'worker_threads';
import { resolve } from 'path';

@Injectable()
export class BiometricRepository {
    
    constructor(private readonly prismaService: PrismaService) {}

    public async compareImage(image1: Buffer, image2) {
        const img1Buffer: Buffer = await this.imgToBuffer(image1).then(value => {
            return value
        });
        const img2Buffer: Buffer = await this.imgToBuffer(image2).then(value => {return value});
        return await this.computeDiff(img1Buffer, img2Buffer).then(value => {
            return value;
        });
    }

    async imgToBuffer(image: Buffer): Promise<Buffer> {

        return new Promise( async (resolve, reject) => {
            console.log(typeof image)
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

    getPersonRecord(person: PersonDTO) {
        return new PersonDTO();
        throw new Error('Method not implemented.');
    }

}