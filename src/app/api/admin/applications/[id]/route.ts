import { NextResponse } from "next/server";
import { isAdminSession, requireAdminApi } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
import { deleteObjectFromS3, s3KeyFromUrl } from "@/lib/s3";
import { Application } from "@/models/Application";

const ALLOWED = new Set([
  "new",
  "reviewing",
  "contacted",
  "placed",
  "archived",
]);

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApi();
  if (!isAdminSession(session)) return session;

  try {
    const { id } = await ctx.params;
    const body = (await request.json()) as {
      status?: string;
      notes?: string;
    };

    await connectDb();
    const update: Record<string, string> = {};
    if (typeof body.status === "string") {
      if (!ALLOWED.has(body.status)) {
        return NextResponse.json({ error: "Invalid status." }, { status: 400 });
      }
      update.status = body.status;
    }
    if (typeof body.notes === "string") {
      update.notes = body.notes.slice(0, 5000);
    }
    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const doc = await Application.findByIdAndUpdate(id, update, {
      new: true,
    }).lean();
    if (!doc) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("application patch error:", err);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApi();
  if (!isAdminSession(session)) return session;

  try {
    const { id } = await ctx.params;
    await connectDb();

    const doc = await Application.findByIdAndDelete(id).lean();
    if (!doc) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    const urls = (doc.attachments || [])
      .map((file) => file.url)
      .filter((url): url is string => Boolean(url));

    await Promise.all(
      urls.map(async (url) => {
        const key = s3KeyFromUrl(url);
        if (!key) return;
        try {
          await deleteObjectFromS3(key);
        } catch (err) {
          console.error("application file delete failed:", key, err);
        }
      }),
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("application delete error:", err);
    return NextResponse.json({ error: "Delete failed." }, { status: 500 });
  }
}
