import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
  getDashboardCredentials,
  safeStringEqual,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };

  try {
    body = await request.json() as { username?: unknown; password?: unknown };
  } catch {
    return NextResponse.json({ error: "اطلاعات ورود معتبر نیست." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const configuredCredentials = getDashboardCredentials();

  if (!configuredCredentials.username || !configuredCredentials.password || !process.env.AUTH_SECRET?.trim()) {
    console.error("Dashboard authentication environment variables are not configured.");
    return NextResponse.json({ error: "ورود در حال حاضر پیکربندی نشده است." }, { status: 500 });
  }

  if (!safeStringEqual(username, configuredCredentials.username) || !safeStringEqual(password, configuredCredentials.password)) {
    return NextResponse.json({ error: "نام کاربری یا رمز عبور اشتباه است." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: await createSessionToken(username),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return response;
}
