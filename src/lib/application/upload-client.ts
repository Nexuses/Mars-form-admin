import { FORM_CONFIG } from "./config";
import type { FileStore } from "./types";

export type UploadedAttachment = {
  slot: keyof FileStore;
  originalName: string;
  url: string;
  contentType: string;
  size: number;
};

async function uploadOne(
  slot: keyof FileStore,
  file: File,
): Promise<UploadedAttachment> {
  const prep = await fetch("/api/apply/upload-url", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      slot,
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    }),
  });

  if (!prep.ok) {
    const data = (await prep.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error || `Could not prepare upload for ${file.name}.`);
  }

  const signed = (await prep.json()) as {
    uploadUrl: string;
    publicUrl: string;
  };

  const put = await fetch(signed.uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!put.ok) {
    throw new Error(
      `Could not upload ${file.name}. Check your connection and try again.`,
    );
  }

  return {
    slot,
    originalName: file.name,
    url: signed.publicUrl,
    contentType: file.type || "application/octet-stream",
    size: file.size,
  };
}

/** Upload all selected files straight to S3 (keeps payloads off the app server). */
export async function uploadApplicationFiles(
  files: FileStore,
  checklistMethod: string,
  onProgress?: (done: number, total: number) => void,
): Promise<UploadedAttachment[]> {
  const queue: { slot: keyof FileStore; file: File }[] = [];
  (["checklist", "license", "lifesupport", "resume"] as const).forEach(
    (slot) => {
      if (slot === "checklist" && checklistMethod !== "upload") return;
      files[slot].forEach((file) => queue.push({ slot, file }));
    },
  );

  if (queue.length > FORM_CONFIG.maxFilesPerSlot * 4) {
    throw new Error("Too many files selected.");
  }

  const out: UploadedAttachment[] = [];
  for (let i = 0; i < queue.length; i++) {
    onProgress?.(i, queue.length);
    out.push(await uploadOne(queue[i].slot, queue[i].file));
  }
  onProgress?.(queue.length, queue.length);
  return out;
}
