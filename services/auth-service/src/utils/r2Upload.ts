import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from '../config/r2.js';
import { Express } from 'express';
export async function uploadToR2(file: Express.Multer.File, userId: string) {
  const key = `avatars/${userId}-${Date.now()}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );

  return {
    url: `${process.env.R2_PUBLIC_URL}/${key}`,
  };
}
