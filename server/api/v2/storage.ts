import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Kysely } from 'kysely';
import type { Database } from '../../db/types';
import { ApiError } from './http';

const imageTypes = new Map([
  ['89504e470d0a1a0a', 'image/png'],
  ['ffd8ff', 'image/jpeg'],
]);

function detectedMime(buffer: Buffer): string | null {
  const hex = buffer.subarray(0, 12).toString('hex');
  for (const [signature, mime] of imageTypes) if (hex.startsWith(signature)) return mime;
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') return 'application/pdf';
  return null;
}

function extensionFor(mime: string) {
  return ({ 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'application/pdf': 'pdf' } as Record<string, string>)[mime];
}

export function localUploadRoot() {
  return path.resolve(process.env.LOCAL_UPLOAD_DIRECTORY || path.join(process.cwd(), 'public', 'uploads'));
}

export async function storeUpload(db: Kysely<Database>, file: Express.Multer.File, uploadedBy: string, altText = '') {
  if (!file || file.size < 1 || file.size > 10 * 1024 * 1024) throw new ApiError(413, 'UPLOAD_SIZE_INVALID', 'Uploads must be between 1 byte and 10 MB.');
  const mime = detectedMime(file.buffer);
  if (!mime || mime !== file.mimetype || !extensionFor(mime)) throw new ApiError(415, 'UPLOAD_TYPE_INVALID', 'Only verified PNG, JPEG, WebP, and PDF files are allowed.');
  const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const provider = process.env.STORAGE_DRIVER === 's3' ? 's3' : 'local';
  const existing = await db.selectFrom('media_assets').selectAll()
    .where('provider', '=', provider).where('checksum_sha256', '=', checksum).where('mime_type', '=', mime)
    .where('status', '=', 'ready').where('deleted_at', 'is', null).executeTakeFirst();
  if (existing) return { item: existing, reused: true };

  const objectKey = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extensionFor(mime)}`;
  let publicUrl: string;
  let cleanup: (() => Promise<unknown>) | null = null;

  if (provider === 's3') {
    const bucket = process.env.S3_BUCKET;
    const publicBase = process.env.S3_PUBLIC_BASE_URL;
    if (!bucket || !publicBase) throw new ApiError(503, 'STORAGE_NOT_CONFIGURED', 'S3 storage is not configured.');
    let publicBaseUrl: URL;
    try { publicBaseUrl = new URL(publicBase); }
    catch { throw new ApiError(503, 'STORAGE_NOT_CONFIGURED', 'S3 public URL is invalid.'); }
    if (process.env.NODE_ENV === 'production' && publicBaseUrl.protocol !== 'https:') throw new ApiError(503, 'STORAGE_NOT_CONFIGURED', 'S3 public URL must use HTTPS in production.');
    const client = new S3Client({
      region: process.env.S3_REGION || 'auto',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      credentials: process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY ? { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY } : undefined,
    });
    try {
      await client.send(new PutObjectCommand({ Bucket: bucket, Key: objectKey, Body: file.buffer, ContentType: mime, CacheControl: 'public, max-age=31536000, immutable', Metadata: { sha256: checksum } }));
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') process.stderr.write(`${JSON.stringify({ level: 'error', event: 'storage_upload_failed', provider, message: error instanceof Error ? error.message : String(error) })}\n`);
      throw new ApiError(502, 'STORAGE_UPLOAD_FAILED', 'Storage upload failed. Please try again.');
    }
    cleanup = () => client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
    publicUrl = `${publicBaseUrl.toString().replace(/\/$/, '')}/${objectKey}`;
  } else {
    const uploadRoot = localUploadRoot();
    const target = path.resolve(uploadRoot, objectKey);
    const relativeTarget = path.relative(uploadRoot, target);
    if (!relativeTarget || relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) throw new ApiError(400, 'UPLOAD_PATH_INVALID', 'The upload path is invalid.');
    try {
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, file.buffer, { flag: 'wx' });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') process.stderr.write(`${JSON.stringify({ level: 'error', event: 'storage_upload_failed', provider, message: error instanceof Error ? error.message : String(error) })}\n`);
      throw new ApiError(500, 'STORAGE_UPLOAD_FAILED', 'Storage upload failed. Please try again.');
    }
    cleanup = () => fs.rm(target, { force: true });
    publicUrl = `/uploads/${objectKey.replace(/\\/g, '/')}`;
  }

  const id = crypto.randomUUID();
  try {
    await db.insertInto('media_assets').values({
      id, uploaded_by: uploadedBy, provider, object_key: objectKey, public_url: publicUrl,
      original_name: path.basename(file.originalname).slice(0, 255), mime_type: mime, byte_size: file.size,
      checksum_sha256: checksum, width: null, height: null, alt_text: altText.slice(0, 300), status: 'ready', deleted_at: null,
    }).execute();
    const item = await db.selectFrom('media_assets').selectAll().where('id', '=', id).executeTakeFirstOrThrow();
    return { item, reused: false };
  } catch (error) {
    await cleanup?.().catch(() => undefined);
    if (process.env.NODE_ENV !== 'production') process.stderr.write(`${JSON.stringify({ level: 'error', event: 'media_record_failed', provider, message: error instanceof Error ? error.message : String(error) })}\n`);
    throw new ApiError(500, 'MEDIA_RECORD_FAILED', 'The server could not process the uploaded file.');
  }
}
