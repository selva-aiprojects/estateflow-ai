import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { token?: string; password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  if (!body.token || !body.password) {
    return NextResponse.json({ error: "token and password required" }, { status: 400 });
  }
  if (body.password.length < 8) {
    return NextResponse.json({ error: "password must be at least 8 characters" }, { status: 400 });
  }

  const ok = await resetPasswordWithToken(body.token, body.password);
  if (!ok) return NextResponse.json({ error: "invalid or expired reset token" }, { status: 400 });

  return NextResponse.json({ data: { ok: true } });
}
