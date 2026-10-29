import bcrypt from "bcryptjs";
import { connection, NextResponse } from "next/server";
import { createAdminToken, setAdminSessionCookie } from "@/lib/auth";
import { connectDb } from "@/lib/db";
import { Admin } from "@/models/Admin";

export async function POST(request: Request) {
  try {
    await connection();
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 },
      );
    }

    await connectDb();
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    const token = await createAdminToken({
      sub: admin._id.toString(),
      email: admin.email,
      name: admin.name,
    });
    await setAdminSessionCookie(token);

    return NextResponse.json({
      ok: true,
      admin: { id: admin._id.toString(), name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error("admin login error:", err);
    return NextResponse.json(
      { error: "Could not sign in." },
      { status: 500 },
    );
  }
}
