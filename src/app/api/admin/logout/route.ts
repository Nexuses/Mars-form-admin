import { connection, NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await connection();
    await clearAdminSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin logout error:", err);
    return NextResponse.json({ error: "Could not sign out." }, { status: 500 });
  }
}
