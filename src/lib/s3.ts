import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

let client: S3Client | null = null;

export function getS3Client() {
  if (!client) {
    client = new S3Client({
      region: requiredEnv("AWS_REGION"),
      credentials: {
        accessKeyId: requiredEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: requiredEnv("AWS_SECRET_ACCESS_KEY"),
      },
    });
  }
  return client;
}

export function getS3Bucket() {
  return requiredEnv("S3_BUCKET");
}

export function getS3Region() {
  return requiredEnv("AWS_REGION");
}

export function publicObjectUrl(key: string): string {
  const bucket = getS3Bucket();
  const region = getS3Region();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

/** Extract object key from a virtual-hosted or path-style S3 HTTPS URL. */
export function s3KeyFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname;
    const path = decodeURIComponent(u.pathname.replace(/^\/+/, ""));
    if (!path) return null;

    // virtual-hosted: bucket.s3.region.amazonaws.com/key
    if (host.includes(".s3.") || host.includes(".s3-")) {
      return path || null;
    }

    // path-style: s3.region.amazonaws.com/bucket/key
    if (host.startsWith("s3.") || host.startsWith("s3-")) {
      const parts = path.split("/");
      if (parts.length < 2) return null;
      return parts.slice(1).join("/") || null;
    }

    return path || null;
  } catch {
    return null;
  }
}

export async function uploadBufferToS3(opts: {
  key: string;
  body: Buffer;
  contentType?: string;
}): Promise<{ key: string; url: string }> {
  const bucket = getS3Bucket();
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: opts.key,
      Body: opts.body,
      ContentType: opts.contentType || "application/octet-stream",
    }),
  );
  return { key: opts.key, url: publicObjectUrl(opts.key) };
}

export async function getSignedDownloadUrl(
  key: string,
  filename?: string,
  expiresIn = 60 * 15,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getS3Bucket(),
    Key: key,
    ResponseContentDisposition: filename
      ? `attachment; filename="${filename.replace(/"/g, "")}"`
      : undefined,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}

export async function deleteObjectFromS3(key: string): Promise<void> {
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: getS3Bucket(),
      Key: key,
    }),
  );
}

/** Browser-direct upload URL so large files never pass through the app server. */
export async function createPresignedPutUrl(opts: {
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const command = new PutObjectCommand({
    Bucket: getS3Bucket(),
    Key: opts.key,
    ContentType: opts.contentType || "application/octet-stream",
  });
  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: opts.expiresIn ?? 60 * 15,
  });
  return {
    uploadUrl,
    publicUrl: publicObjectUrl(opts.key),
    key: opts.key,
  };
}

export function isAllowedApplicationUploadKey(key: string): boolean {
  return key.startsWith("applications/");
}

/** True when a public URL points at an applications/* object in this bucket. */
export function isOurApplicationAttachmentUrl(url: string): boolean {
  const key = s3KeyFromUrl(url);
  if (!key || !isAllowedApplicationUploadKey(key)) return false;
  try {
    const u = new URL(url);
    const bucket = getS3Bucket();
    const host = u.hostname;
    return (
      host === `${bucket}.s3.${getS3Region()}.amazonaws.com` ||
      host.startsWith(`${bucket}.s3.`) ||
      host.startsWith(`${bucket}.s3-`) ||
      ((host.startsWith("s3.") || host.startsWith("s3-")) &&
        u.pathname.replace(/^\/+/, "").startsWith(`${bucket}/`))
    );
  } catch {
    return false;
  }
}
