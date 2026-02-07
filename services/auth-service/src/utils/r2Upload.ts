import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import type { Express } from 'express';
import { r2Client } from '../config/r2.js';

/* ---------------- upload ---------------- */

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
    key,
    url: `${process.env.R2_PUBLIC_URL}/${key}`,
  };
}

export function getR2KeyFromUrl(url: string) {
  const u = new URL(url);

  // remove leading slash
  return u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname;
}

export async function deleteFromR2(key: string) {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    })
  );
}
