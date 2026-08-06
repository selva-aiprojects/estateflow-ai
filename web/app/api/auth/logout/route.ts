import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroySession, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await destroySession();
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ data: { ok: true } });
}
