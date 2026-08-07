import { NextResponse } from "next/server";
import { signPortalPossession } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }
  const step = String(body.step ?? "").trim();
  if (!step) {
    return NextResponse.json({ error: "step is required" }, { status: 422 });
  }
  const result = await signPortalPossession(step);
  if (!result.ok) {
    return NextResponse.json({ error: "could not record sign-off" }, { status: 422 });
  }
  return NextResponse.json({ data: result }, { status: 201 });
}
