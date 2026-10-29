import { NextResponse } from "next/server";
import { isAdminSession, requireAdminApi } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { getSignedDownloadUrl, s3KeyFromUrl } from "@/lib/s3";
import { Application } from "@/models/Application";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string; fileId: string }> },
) {
  const session = await requireAdminApi();
  if (!isAdminSession(session)) return session;

  try {
    const { id, fileId } = await ctx.params;
    await connectDb();
    const app = await Application.findById(id).lean();
    if (!app) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    type AttachmentLean = {
      _id?: unknown;
      url?: string;
      originalName?: string;
    };

    const file = ((app.attachments || []) as AttachmentLean[]).find(
      (a) => String(a._id) === fileId,
    );
    if (!file?.url) {
      return NextResponse.json({ error: "File not found." }, { status: 404 });
    }

    const key = s3KeyFromUrl(file.url);
    if (key) {
      const signed = await getSignedDownloadUrl(
        key,
        file.originalName || "download",
      );
      return NextResponse.redirect(signed);
    }

    return NextResponse.redirect(file.url);
  } catch (err) {
    console.error("file download error:", err);
    return NextResponse.json({ error: "Download failed." }, { status: 500 });
  }
}
