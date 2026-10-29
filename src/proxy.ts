import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth-token";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const session = token ? await verifyAdminToken(token) : null;

  if (pathname === "/admin/signup" || pathname.startsWith("/admin/signup/")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const isLoginPage = pathname === "/admin";
  const isProtected =
    pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/");

  // Keep login + login/logout APIs reachable without a session
  const isPublicApi =
    pathname === "/api/admin/login" || pathname === "/api/admin/logout";

  if (isProtected && !isPublicApi && !session) {
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginPage && session) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
