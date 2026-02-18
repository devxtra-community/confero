import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client } from '../config/r2.js';

const BUCKET = process.env.R2_BUCKET!;

export function buildAvatarKey(userId: string, ext: string) {
  return `users/${userId}/avatar-${Date.now()}.${ext}`;
}
export function buildBannerKey(userId: string, ext: string) {
  return `users/${userId}/banner-${Date.now()}.${ext}`;
}

export async function getSignedUploadUrl(params: {
  key: string;
  contentType: string;
}) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: params.key,
    ContentType: params.contentType,
  });

  const url = await getSignedUrl(r2Client, command, {
    expiresIn: 60, // seconds
  });

  return url;
}

export async function deleteFromR2(key: string) {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

export function getPublicUrlForKey(key: string) {
  // already a full url → do not touch
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}
