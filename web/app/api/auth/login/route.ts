import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginWithPassword, createSession, SESSION_COOKIE, AuthError } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "email and password required" }, { status: 400 });
  }

  const user = await loginWithPassword(body.email, body.password);
  if (!user) return NextResponse.json({ error: "invalid credentials" }, { status: 401 });

  const token = await createSession(user.id);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });

  return NextResponse.json({ data: user });
}
