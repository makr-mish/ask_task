import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const adminSession = req.cookies.get(ADMIN_COOKIE)?.value;

  const isAdminPage = pathname.startsWith("/admin");
  const isAdminLoginPage = pathname === "/admin-login";
  const isAdminApi =
    pathname.startsWith("/api/admin/login") ||
    pathname.startsWith("/api/admin/logout");

  if (isAdminApi) {
    return NextResponse.next();
  }

  if (isAdminPage && pathname !== "/admin-login") {
    if (!adminSession) {
      const url = new URL("/admin-login", req.url);
      return NextResponse.redirect(url);
    }
  }

  if (isAdminLoginPage && adminSession) {
    const url = new URL("/admin", req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin-login", "/api/admin/:path*"],
};