import { connection } from "next/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getAdminSession, type AdminSession } from "@/lib/auth";

export async function requireAdminPage(): Promise<AdminSession> {
  await connection();
  const session = await getAdminSession();
  if (!session) redirect("/admin");
  return session;
}

export async function requireAdminApi(): Promise<
  AdminSession | NextResponse
> {
  await connection();
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session;
}

export function isAdminSession(
  value: AdminSession | NextResponse,
): value is AdminSession {
  return !(value instanceof NextResponse);
}
