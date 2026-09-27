import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/login";
  const isLoginApiRoute = pathname === "/api/auth/login";
  const isLogoutApiRoute = pathname === "/api/auth/logout";
  const hasValidSession = await isValidSessionToken(request.cookies.get(AUTH_COOKIE_NAME)?.value);

  if (isLoginRoute) {
    return hasValidSession ? NextResponse.redirect(new URL("/dashboard", request.url)) : NextResponse.next();
  }

  if (isLoginApiRoute || isLogoutApiRoute) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return hasValidSession
      ? NextResponse.next()
      : NextResponse.json({ error: "برای دسترسی وارد شوید." }, { status: 401 });
  }

  if (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    return hasValidSession ? NextResponse.next() : NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasValidSession) return NextResponse.redirect(new URL("/dashboard", request.url));

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: "/:path*",
};
