import { Injectable } from '@nestjs/common';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { AWS_S3_ERROR } from 'src/common/constants';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: `${this.configService.get<string>('AWS_DEFAULT_REGION')}`,
      credentials: {
        accessKeyId: `${this.configService.get<string>('AWS_ACCESS_KEY')}`,
        secretAccessKey: `${this.configService.get<string>('AWS_SECRET_ACCESS_KEY')}`
      }
    });
  }

  async getObjectFromDirectory(bucketName: string, directory: string, fileName: string): Promise<string | null> {
    const key = directory ? `${directory}/${fileName}` : fileName;
    
    // Paras to create command to get object from aws S3 bucket
    const getObjectParams = {
      Bucket: bucketName,
      Key: key
    };
    // command to get object from aws s3 
    const command = new GetObjectCommand(getObjectParams);

    try {
      const response = await this.s3Client.send(command);
      if (response.Body) {
        return response.Body?.transformToString();
      } else {
        return null;
      }
    } catch (error) {
      if (error?.name === AWS_S3_ERROR.NO_SUCH_KEY) {
        return null;
      }
      throw error;
    }
  }
}
