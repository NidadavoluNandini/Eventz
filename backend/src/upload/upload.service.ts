import { Injectable, BadRequestException } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../aws/s3.client';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File) {
    

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files allowed');
    }

    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) {
      throw new BadRequestException('S3 bucket not configured');
    }

    const ext = file.originalname.split('.').pop();
    const key = `events/${randomUUID()}.${ext}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const region = process.env.AWS_REGION;
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { url };
  }
}
