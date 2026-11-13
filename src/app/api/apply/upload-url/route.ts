import { connection } from "next/server";
import { NextResponse } from "next/server";
import { FORM_CONFIG } from "@/lib/application/config";
import { createPresignedPutUrl } from "@/lib/s3";
import { safeFileName } from "@/lib/uploads";

const SLOTS = new Set(["checklist", "license", "lifesupport", "resume"]);
const ALLOWED_EXT = new Set([
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "heic",
  "doc",
  "docx",
]);

export async function POST(request: Request) {
  try {
    await connection();
    const body = (await request.json()) as {
      slot?: string;
      fileName?: string;
      contentType?: string;
      size?: number;
    };

    const slot = typeof body.slot === "string" ? body.slot : "";
    const fileName = typeof body.fileName === "string" ? body.fileName : "";
    const contentType =
      typeof body.contentType === "string" && body.contentType
        ? body.contentType
        : "application/octet-stream";
    const size = typeof body.size === "number" ? body.size : 0;

    if (!SLOTS.has(slot)) {
      return NextResponse.json({ error: "Invalid upload slot." }, { status: 400 });
    }
    if (!fileName.trim()) {
      return NextResponse.json({ error: "Missing file name." }, { status: 400 });
    }

    const ext = (fileName.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 400 },
      );
    }

    const maxBytes = FORM_CONFIG.maxFileMB * 1024 * 1024;
    if (!size || size < 1 || size > maxBytes) {
      return NextResponse.json(
        { error: `File must be between 1 byte and ${FORM_CONFIG.maxFileMB} MB.` },
        { status: 400 },
      );
    }

    const uploadId = crypto.randomUUID();
    const key = `applications/inbox/${uploadId}/${slot}-${Date.now()}-${safeFileName(fileName)}`;
    const signed = await createPresignedPutUrl({
      key,
      contentType,
    });

    return NextResponse.json({
      uploadUrl: signed.uploadUrl,
      publicUrl: signed.publicUrl,
      key: signed.key,
    });
  } catch (err) {
    console.error("upload-url error:", err);
    return NextResponse.json(
      { error: "Could not prepare file upload." },
      { status: 500 },
    );
  }
}
