import { NextResponse } from "next/server";
import { isAdminSession, requireAdminApi } from "@/lib/admin-guard";
import { connectDb } from "@/lib/db";
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
