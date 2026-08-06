import { NextResponse } from "next/server";
import { autoMatchRecon } from "@/lib/mock-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request, ctx: { params: Promise<{ ref: string }> }) {
  const { ref } = await ctx.params;
  let body: { description?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json body" }, { status: 400 });
  }

  const row = autoMatchRecon(decodeURIComponent(ref), body.description);
  if (!row) {
    return NextResponse.json({ error: "reconciliation row not found" }, { status: 404 });
  }
  return NextResponse.json({ data: row });
}
