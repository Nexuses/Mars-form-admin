import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  SESSION_DAYS,
  createAdminToken,
  verifyAdminToken,
  type AdminSession,
} from "@/lib/auth-token";

export {
  ADMIN_COOKIE,
  SESSION_DAYS,
  createAdminToken,
  verifyAdminToken,
  type AdminSession,
};

export async function setAdminSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearAdminSessionCookie() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}
