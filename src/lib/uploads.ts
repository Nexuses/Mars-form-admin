import { uploadBufferToS3 } from "@/lib/s3";

export function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 120) || "file";
}

export async function saveApplicationFile(opts: {
  applicationId: string;
  slot: string;
  originalName: string;
  content: Buffer;
  contentType?: string;
}): Promise<{ url: string }> {
  const storedName = `${opts.slot}-${Date.now()}-${safeFileName(opts.originalName)}`;
  const key = `applications/${opts.applicationId}/${storedName}`;
  const uploaded = await uploadBufferToS3({
    key,
    body: opts.content,
    contentType: opts.contentType,
  });
  return { url: uploaded.url };
}
